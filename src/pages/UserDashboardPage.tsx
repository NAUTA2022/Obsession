import { useState } from 'react';
import { images } from '../config/assets';
import HeroCard from '../components/ui/HeroCard';
import { StatCard } from '../components/ui/cards';
import PillsButtons from '../components/ui/PillsButtons';

// Datos mock para el dashboard de usuario
const featuredModels = [
  {
    id: 1,
    name: 'Sofia Martinez',
    avatar: images.sampleProfile,
    coverImage: images.sampleProfile,
    isOnline: true,
    subscribers: 12500,
    newContent: 3,
    category: 'Lifestyle'
  },
  {
    id: 2,
    name: 'Isabella Rodriguez',
    avatar: images.sampleProfile,
    coverImage: images.sampleProfile,
    isOnline: false,
    subscribers: 8900,
    newContent: 1,
    category: 'Fashion'
  },
  {
    id: 3,
    name: 'Camila Torres',
    avatar: images.sampleProfile,
    coverImage: images.sampleProfile,
    isOnline: true,
    subscribers: 15200,
    newContent: 5,
    category: 'Fitness'
  },
  {
    id: 4,
    name: 'Valentina Silva',
    avatar: images.sampleProfile,
    coverImage: images.sampleProfile,
    isOnline: false,
    subscribers: 6700,
    newContent: 2,
    category: 'Art'
  }
];

const recentPurchases = [
  {
    id: 1,
    modelName: 'Sofia Martinez',
    contentTitle: 'Sesión de fotos exclusiva',
    purchaseDate: '2024-01-15',
    amount: 25.00,
    type: 'individual'
  },
  {
    id: 2,
    modelName: 'Isabella Rodriguez',
    contentTitle: 'Pack premium del mes',
    purchaseDate: '2024-01-10',
    amount: 45.00,
    type: 'package'
  }
];

export default function UserDashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todo');

  const categories = ['Todo', 'Lifestyle', 'Fashion', 'Fitness', 'Art'];

  const filteredModels = selectedCategory === 'Todo' 
    ? featuredModels 
    : featuredModels.filter(model => model.category === selectedCategory);

  return (
    <div className="w-full h-full grid grid-cols-1 gap-6 lg:grid-cols-5 xl:grid-cols-6 animate-fade-in">
      {/* Contenido Principal */}
      <div className="min-w-0 lg:col-span-3 xl:col-span-4 gap-6 flex flex-col">
        
        {/* Sección de Novedades */}
        <div className="flex items-center">
          <h2 className="text-xl sm:text-2xl font-semibold">Descubre Contenido Exclusivo</h2>
        </div>
        
        <HeroCard
          imageSrc={images.sampleProfile}
          imageAlt="Contenido Premium"
          title="Accede a Contenido Exclusivo"
          description="Explora el contenido más exclusivo de tus creadoras favoritas. Descubre nuevas personalidades y disfruta de experiencias únicas."
          ctaText="Explorar Creadores"
          onCtaClick={() => {
            window.location.href = '/creators';
          }}
          contentClassName="p-4 sm:p-5 md:p-6"
          mediaClassName="max-w-[280px] sm:max-w-[300px] md:max-w-[320px]"
        />

        {/* Estadísticas del Usuario */}
        <div className='flex flex-col gap-4'>
          <h2 className="text-xl sm:text-2xl font-semibold">Tu Actividad</h2>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            <StatCard value={8} label="Modelos Siguiendo" />
            <StatCard value={23} label="Contenido Comprado" />
            <StatCard value={3} label="Suscripciones Activas" />
          </div>
        </div>

        {/* Modelos Destacadas */}
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center'>
            <h2 className='text-xl sm:text-2xl font-semibold'>Modelos Destacadas</h2>
            <div className='flex flex-wrap items-center gap-2'>
              {categories.map((category) => (
                <PillsButtons 
                  key={category}
                  label={category} 
                  onClick={() => setSelectedCategory(category)} 
                  isActive={selectedCategory === category} 
                />
              ))}
            </div>
          </div>
          
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4'>
            {filteredModels.map((model) => (
              <div key={model.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <img 
                    src={model.coverImage} 
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <div className={`w-3 h-3 rounded-full ${model.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                  {model.newContent > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {model.newContent} nuevo{model.newContent > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={model.avatar} 
                      alt={model.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-500">{model.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {model.subscribers.toLocaleString()} seguidores
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compras Recientes */}
        <div className='flex flex-col gap-4'>
          <h2 className="text-xl sm:text-2xl font-semibold">Compras Recientes</h2>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-medium">Historial de Compras</h3>
            </div>
            <div className="divide-y">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium">
                        {purchase.modelName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{purchase.contentTitle}</p>
                      <p className="text-sm text-gray-500">por {purchase.modelName}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">${purchase.amount}</p>
                    <p className="text-sm text-gray-500">{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Ver todo el historial →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Derecho */}
      <div className="min-w-0 lg:col-span-2 xl:col-span-2 flex flex-col gap-6">
        
        {/* Suscripciones Activas */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Suscripciones Activas</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={images.sampleProfile} 
                  alt="Sofia Martinez"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">Sofia Martinez</p>
                  <p className="text-xs text-gray-500">Premium</p>
                </div>
              </div>
              <span className="text-green-600 text-xs">Activa</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={images.sampleProfile} 
                  alt="Isabella Rodriguez"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">Isabella Rodriguez</p>
                  <p className="text-xs text-gray-500">VIP</p>
                </div>
              </div>
              <span className="text-green-600 text-xs">Activa</span>
            </div>
          </div>
          <div className="p-4 border-t">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
              Gestionar Suscripciones
            </button>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Recomendado para ti</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-3">
              <img 
                src={images.sampleProfile} 
                alt="Modelo recomendada"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">Lucia Fernandez</h4>
                <p className="text-xs text-gray-500 mb-2">Contenido exclusivo de lifestyle</p>
                <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 transition-colors">
                  Seguir
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <img 
                src={images.sampleProfile} 
                alt="Modelo recomendada"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">Andrea Morales</h4>
                <p className="text-xs text-gray-500 mb-2">Fitness y bienestar</p>
                <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 transition-colors">
                  Seguir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones Recientes */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notificaciones</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">Sofia Martinez subió contenido nuevo</p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">Tu suscripción se renovó exitosamente</p>
                <p className="text-xs text-gray-500">Hace 1 día</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">Nueva modelo recomendada para ti</p>
                <p className="text-xs text-gray-500">Hace 2 días</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t">
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
