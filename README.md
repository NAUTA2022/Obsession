# Obsession Dashboard

Un dashboard moderno y escalable construido con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Tecnologías

- **React 18** + **TypeScript** - Framework y tipado estático
- **Vite** - Build tool rápido y moderno
- **Tailwind CSS** - Framework de estilos utility-first
- **React Router DOM** - Navegación y routing
- **Zustand** - Manejo de estado global ligero
- **Lucide React** - Iconos modernos y consistentes

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes básicos (Button, Input, Card, Modal)
│   ├── layout/         # Layout del dashboard (Sidebar, Header, Footer)
│   └── charts/         # Componentes de gráficos y visualización de datos
├── pages/              # Páginas principales del dashboard
├── hooks/              # Custom hooks para lógica reutilizable
├── store/              # Estado global con - (Si es necesario)
├── services/           # Servicios API y llamadas HTTP
├── utils/              # Funciones utilitarias y helpers
├── types/              # Definiciones de tipos TypeScript
├── constants/          # Constantes y configuración de la app
└── assets/             # Recursos estáticos
    ├── icons/          # Iconos personalizados SVG
    └── images/         # Imágenes y recursos gráficos
```

## 🛠️ Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## 🚀 Despliegue

Este proyecto está configurado para desplegarse en **Railway**:

1. Conecta tu repositorio a Railway
2. Railway detectará automáticamente la configuración de Vite
3. Las variables de entorno se configuran en el panel de Railway
4. El despliegue es automático en cada push a main

### Variables de Entorno

```env
VITE_API_BASE_URL=tu_api_url_aqui
```

## 📦 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build local
- `npm run lint` - Linter ESLint

## 🎨 Características

- ✅ Diseño responsive y moderno
- ✅ Tema personalizable con Tailwind
- ✅ Componentes reutilizables y modulares
- ✅ Tipado estricto con TypeScript
- ✅ Estado global optimizado
- ✅ Routing dinámico
- ✅ Optimizado para producción

## 🏗️ Arquitectura

El proyecto sigue una arquitectura modular y escalable:

- **Separación de responsabilidades** por carpetas
- **Componentes atómicos** reutilizables
- **Estado centralizado** con Zustand
- **Servicios desacoplados** para APIs
- **Tipado fuerte** en toda la aplicación
- **Configuración flexible** por entornos
# Obsession
