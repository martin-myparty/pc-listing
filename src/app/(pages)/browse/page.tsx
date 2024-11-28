"use client";
import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { graphicsCards } from '../../../../data/PC.GRAPHICCARDS';
import { motherboards } from '../../../../data/PC.MOTHERBOARDS';
import { processors } from '../../../../data/PC.PROCESSORS';
import { ramModules } from '../../../../data/PC.RAM';
import { Slider } from '@/app/components/Slider';
import { Star, ArrowUpDown, Cpu, MonitorPlay, CircuitBoard, HardDrive, Heart } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';
import Link from 'next/link';
import { useFavorites } from '@/store/useFavorites';

// Add this type definition near the top with other types
type ComponentType = 'gpu' | 'cpu' | 'motherboard' | 'ram';

// Define strict types for components
type BaseComponent = {
  id: string;
  name: string;
  price: number;
  company: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  seller: string;
  availability: string;
  type: ComponentType;
};

type GPUComponent = BaseComponent & {
  category: 'gpu';
  vram: string;
  brand: string;
  model: string;
};

type CPUComponent = BaseComponent & {
  category: 'cpu';
  cores: number;
  threads: number;
  base_clock: string;
  turbo_clock: string;
  description: string;
};

type RAMComponent = BaseComponent & {
  category: 'ram';
  type: string;
  capacity: string;
  speed: string;
};

type MotherboardComponent = BaseComponent & {
  category: 'motherboard';
  socket: string;
  formFactor: string;
  integration: string;
};

// Define a type for mapped components
type MappedComponent = (GPUComponent | CPUComponent | RAMComponent | MotherboardComponent) & {
  rating: number;
  reviews: number;
  seller: string;
  availability: string;
  type: ComponentType;
};

// Types for dynamic filters
type FilterOption = {
  label: string;
  value: string;
  count: number;
};

type DynamicFilters = {
  [key: string]: {
    label: string;
    options: FilterOption[];
  };
};

// Add seller URLs type
type SellerInfo = {
    name: string;
    url: string;
};

// Add seller URLs mapping
const SELLER_URLS: Record<string, SellerInfo> = {
    "Amazon": {
        name: "Amazon",
        url: "https://www.amazon.in"
    },
    "Flipkart": {
        name: "Flipkart",
        url: "https://www.flipkart.com"
    },
    "Newegg": {
        name: "Newegg",
        url: "https://www.newegg.com"
    }
};

export default function BrowsePage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([0, 200000]);
    const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'featured'>('featured');
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
    const [dynamicFilters, setDynamicFilters] = useState<DynamicFilters>({});

    const categoryOptions = [
        { value: 'all', label: 'All Categories', icon: <CircuitBoard className="w-4 h-4" /> },
        { value: 'cpu', label: 'Processors', icon: <Cpu className="w-4 h-4" /> },
        { value: 'gpu', label: 'Graphics Cards', icon: <MonitorPlay className="w-4 h-4" /> },
        { value: 'motherboard', label: 'Motherboards', icon: <CircuitBoard className="w-4 h-4" /> },
        { value: 'ram', label: 'Memory', icon: <HardDrive className="w-4 h-4" /> }
    ];

    // Move allComponents to useMemo to fix exhaustive-deps warning
    const allComponents = useMemo(() => {
        const gpuComponents: MappedComponent[] = graphicsCards.map(item => ({
            ...item,
            category: 'gpu' as const,
            type: 'gpu',
            rating: 4.5,
            reviews: 128,
            seller: "Amazon",
            availability: "In Stock",
            image: item.image || '/images/placeholder.jpg',
            brand: item.brand || item.company,
            model: item.model || 'Standard'
        }));

        const cpuComponents: MappedComponent[] = processors.map(item => ({
            ...item,
            category: 'cpu' as const,
            type: 'cpu',
            rating: 4.3,
            reviews: 95,
            seller: "Newegg",
            availability: "In Stock",
            image: item.image || '/images/placeholder.jpg'
        }));

        const mbComponents: MappedComponent[] = motherboards.map(item => ({
            ...item,
            category: 'motherboard' as const,
            type: 'motherboard',
            rating: 4.2,
            reviews: 76,
            seller: "Amazon",
            availability: "Limited Stock",
            image: item.image || '/images/placeholder.jpg'
        }));

        const ramComponents: MappedComponent[] = ramModules.map(item => ({
            ...item,
            category: 'ram' as const,
            type: 'ram',
            rating: 4.4,
            reviews: 112,
            seller: "Newegg",
            availability: "In Stock",
            image: item.image || '/images/placeholder.jpg'
        }));

        return [...gpuComponents, ...cpuComponents, ...mbComponents, ...ramComponents];
    }, []);

    useEffect(() => {
        const filters: DynamicFilters = {};
        const components = allComponents;

        // Always show brand filter
        filters.brand = {
            label: 'Brand',
            options: Array.from(new Set(components.map(c => c.company)))
                .map(brand => ({
                    label: brand,
                    value: brand,
                    count: components.filter(c => c.company === brand).length
                }))
        };

        // Category specific filters
        if (selectedCategory === 'gpu' || selectedCategory === 'all') {
            const gpuComponents = components.filter(
                (c): c is MappedComponent & GPUComponent => c.category === 'gpu'
            );
            if (gpuComponents.length > 0) {
                filters.vram = {
                    label: 'VRAM',
                    options: Array.from(new Set(gpuComponents.map(c => c.vram)))
                        .map(vram => ({
                            label: vram,
                            value: vram,
                            count: gpuComponents.filter(c => c.vram === vram).length
                        }))
                };
            }
        }

        if (selectedCategory === 'ram' || selectedCategory === 'all') {
            const ramComponents = components.filter(
                (c): c is MappedComponent & RAMComponent => c.category === 'ram'
            );
            if (ramComponents.length > 0) {
                filters.type = {
                    label: 'Type',
                    options: Array.from(new Set(ramComponents.map(c => c.type)))
                        .map(type => ({
                            label: type,
                            value: type,
                            count: ramComponents.filter(c => c.type === type).length
                        }))
                };
            }
        }

        setDynamicFilters(filters);
    }, [selectedCategory, allComponents]);

    const filteredComponents = allComponents.filter(component => {
        const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
        const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = component.price >= priceRange[0] && component.price <= priceRange[1];
        
        const matchesFilters = Object.entries(selectedFilters).every(([key, values]) => {
            if (values.length === 0) return true;
            const componentValue = String(component[key as keyof typeof component]);
            return values.includes(componentValue);
        });

        return matchesCategory && matchesSearch && matchesPrice && matchesFilters;
    }).sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
    });

    // Add favorites store hooks
    const { toggleFavorite, favorites } = useFavorites();

    // Add a helper function to check if a component is favorite
    const isComponentFavorite = (componentId: string) => {
        return favorites.some(fav => fav.id === componentId);
    };

    return (
        <div className="min-h-screen bg-[#111827]">
            {/* Top Search Bar */}
            <div className="sticky top-0 z-50 bg-[#1F2937] shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-6">
                        {/* Website Logo/Name */}
                        <Link 
                            href="/" 
                            className="text-xl font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-2"
                        >
                            <CircuitBoard className="w-6 h-6" />
                            <span>BuildMyPC</span>
                        </Link>

                        {/* Search and Category Selection */}
                        <div className="flex flex-1 items-center gap-4">
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search components..."
                                className="flex-1 px-4 py-2 rounded-lg bg-[#374151] border-none text-white placeholder-gray-400"
                            />
                            <CustomSelect
                                value={selectedCategory}
                                onChange={setSelectedCategory}
                                options={categoryOptions}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    <div className="w-64 flex-shrink-0">
                        <div className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
                            <div className="space-y-4 pr-4 border-r border-gray-700">
                                {/* Price Range */}
                                <div className="bg-[#1F2937] p-4 rounded-lg">
                                    <h3 className="text-white font-medium mb-4">Price Range</h3>
                                    <Slider
                                        value={priceRange}
                                        onChange={setPriceRange}
                                        min={0}
                                        max={200000}
                                        step={5000}
                                    />
                                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                                        <span>₹{priceRange[0].toLocaleString()}</span>
                                        <span>₹{priceRange[1].toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Dynamic Filters */}
                                {Object.entries(dynamicFilters).map(([key, filter]) => (
                                    <div key={key} className="bg-[#1F2937] p-4 rounded-lg">
                                        <h3 className="text-white font-medium mb-4">{filter.label}</h3>
                                        <div className="space-y-1">
                                            {filter.options.map(option => (
                                                <label 
                                                    key={option.value} 
                                                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#374151] transition-colors cursor-pointer text-gray-300"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFilters[key]?.includes(option.value) || false}
                                                        onChange={(e) => {
                                                            setSelectedFilters(prev => {
                                                                const current = prev[key] || [];
                                                                return {
                                                                    ...prev,
                                                                    [key]: e.target.checked
                                                                        ? [...current, option.value]
                                                                        : current.filter(v => v !== option.value)
                                                                };
                                                            });
                                                        }}
                                                        className="rounded border-gray-600 bg-[#374151] text-blue-500 focus:ring-offset-[#1F2937]"
                                                    />
                                                    <span className="text-sm flex-1">{option.label}</span>
                                                    <span className="text-xs text-gray-500">({option.count})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 py-6">
                        {/* Sort Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                {filteredComponents.length} items found
                            </p>
                            <button
                                onClick={() => setSortBy(prev => 
                                    prev === 'price-asc' ? 'price-desc' : 'price-asc'
                                )}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 hover:text-blue-400 transition-colors"
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                <span>Sort by price</span>
                            </button>
                        </div>

                        {/* Component List */}
                        <div className="space-y-6">
                            {filteredComponents.map((component) => (
                                <div
                                    key={component.id}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                                >
                                    <div className="flex gap-6">
                                        {/* Image */}
                                        <div className="w-48 h-48 relative flex-shrink-0">
                                            <Image
                                                src={component.image || '/images/placeholder.jpg'}
                                                alt={component.name}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-medium mb-2">{component.name}</h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                        {component.company}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold">₹{component.price.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-500">{component.availability}</p>
                                                </div>
                                            </div>

                                            {/* Specifications */}
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                {'vram' in component && (
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">VRAM:</span> {component.vram}
                                                    </p>
                                                )}
                                                {'cores' in component && (
                                                    <>
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Cores/Threads:</span> {component.cores}/{component.threads}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Clock Speed:</span> {component.base_clock} - {component.turbo_clock}
                                                        </p>
                                                    </>
                                                )}
                                                {'capacity' in component && (
                                                    <>
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Capacity:</span> {component.capacity}
                                                        </p>
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Speed:</span> {component.speed}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {/* Rating and Reviews */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        <span className="ml-1">{component.rating}</span>
                                                    </div>
                                                    <span className="text-gray-500">({component.reviews} reviews)</span>
                                                    <span className="text-gray-500">•</span>
                                                    <a 
                                                        href={SELLER_URLS[component.seller].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-500 transition-colors"
                                                    >
                                                        Buy on {SELLER_URLS[component.seller].name}
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => toggleFavorite(component)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            isComponentFavorite(component.id) 
                                                            ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                                                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                        }`}
                                                    >
                                                        <Heart 
                                                            className={`w-5 h-5 ${
                                                                isComponentFavorite(component.id) ? 'fill-current' : ''
                                                            }`} 
                                                        />
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleFavorite(component)}
                                                        className={`px-6 py-2 rounded-lg transition-colors ${
                                                            isComponentFavorite(component.id)
                                                            ? 'bg-red-500 hover:bg-red-600 text-white'
                                                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        }`}
                                                    >
                                                        {isComponentFavorite(component.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}