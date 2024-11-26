"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { graphicsCards } from '../../../../data/PC.GRAPHICCARDS';
import { motherboards } from '../../../../data/PC.MOTHERBOARDS';
import { processors } from '../../../../data/PC.PROCESSORS';
import { ramModules } from '../../../../data/PC.RAM';
import { Slider } from '@/app/components/Slider';
import { Sparkles, ArrowUp, ArrowDown } from 'lucide-react';
import { CustomSelect } from '@/app/components/CustomSelect';


export default function BrowsePage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState([0, 2000]);
    const [sortBy, setSortBy] = useState('featured');
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

    const allComponents = [
        ...graphicsCards.map(item => ({ ...item, category: 'gpu' })),
        ...motherboards.map(item => ({ ...item, category: 'motherboard' })),
        ...processors.map(item => ({ ...item, category: 'cpu' })),
        ...ramModules.map(item => ({ ...item, category: 'ram' }))
    ];

    // Get unique brands
    const brands = [...new Set(allComponents.map(item => item.company))];

    const sortOptions = [
        {
            value: 'featured',
            label: 'Featured',
            icon: <Sparkles className="h-5 w-5" />
        },
        {
            value: 'price-asc',
            label: 'Price: Low to High',
            icon: <ArrowUp className="h-5 w-5" />
        },
        {
            value: 'price-desc',
            label: 'Price: High to Low',
            icon: <ArrowDown className="h-5 w-5" />
        }
    ];

    const filteredComponents = allComponents.filter(component => {
        const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
        const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = component.price >= priceRange[0] && component.price <= priceRange[1];
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(component.company);
        return matchesCategory && matchesSearch && matchesPrice && matchesBrand;
    });

    // Sort components
    const sortedComponents = [...filteredComponents].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            default:
                return 0;
        }
    });

    return (
        <div className="flex min-h-screen pt-24">
            {/* Filters Sidebar */}
            <div className="w-64 flex-shrink-0 p-6 border-r border-gray-200 dark:border-gray-700">
                <h2 className="font-bold mb-4">Filters</h2>

                {/* Price Range */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Price Range</h3>
                    <Slider
                        value={priceRange}
                        onChange={setPriceRange}
                        min={0}
                        max={2000}
                        step={10}
                    />
                    <div className="flex justify-between mt-2 text-sm">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                    </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Brands</h3>
                    {brands.map(brand => (
                        <label key={brand} className="flex items-center space-x-2 mb-2">
                            <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedBrands([...selectedBrands, brand]);
                                    } else {
                                        setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                    }
                                }}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm">{brand}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Top Bar */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search components..."
                            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            <option value="cpu">Processors</option>
                            <option value="gpu">Graphics Cards</option>
                            <option value="motherboard">Motherboards</option>
                            <option value="ram">Memory</option>
                        </select>
                    </div>

                    <CustomSelect
                        value={sortBy}
                        onChange={setSortBy}
                        options={sortOptions}
                    />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {sortedComponents.map((component) => (
                        <div key={component.name} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                            <div className="relative h-48 group">
                                <Image
                                    src={component.image || '/images/placeholder.jpg'}
                                    alt={component.name}
                                    fill
                                    className="object-contain p-4 group-hover:scale-105 transition-transform"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium mb-2">{component.name}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                    {component.company}
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">${component.price}</span>
                                    <button className="bg-black text-white dark:bg-white dark:text-black px-4 py-1 rounded-full text-sm hover:opacity-80 transition-opacity">
                                        Add to Build
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}