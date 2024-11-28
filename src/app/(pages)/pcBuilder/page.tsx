"use client";
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { graphicsCards } from '../../../../data/PC.GRAPHICCARDS';
import { processors } from '../../../../data/PC.PROCESSORS';
import { motherboards } from '../../../../data/PC.MOTHERBOARDS';
import { ramModules } from '../../../../data/PC.RAM';
import Image from 'next/image';
import { FiEdit2, FiHeart, FiPlus, FiX, FiChevronDown, FiChevronRight, FiMonitor, FiPlay, FiCpu, FiCode, FiFilm, FiLock, FiUnlock, FiMaximize2 } from 'react-icons/fi';
import { useDialog } from '@/app/components/GlobalDialog';
import { useFavorites } from '@/store/useFavorites';

// Define types for our components
type ComponentType = 'gpu' | 'cpu' | 'motherboard' | 'ram';
type PCComponent = {
  id: string;
  name: string;
  price: number;
  company: string;
  type: ComponentType;
  image?: string;
};

type BuildPurpose = {
  id: string;
  name: string;
  description: string;
  minBudget: number;
  maxBudget: number;
  icon: React.ReactNode; // For purpose-specific icons
};

type BudgetFlexibility = 'strict' | 'flexible' | 'very_flexible';

type PCBuild = {
  id: string;
  name: string;
  budget: number;
  purpose: string;
  budgetFlexibility: BudgetFlexibility;
  components: {
    gpu?: PCComponent;
    cpu?: PCComponent;
    motherboard?: PCComponent;
    ram?: PCComponent;
  };
};

type DragDropResult = {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
};

type CategoryState = {
  [key in ComponentType]: boolean;
};

// Add this constant near the top of the file with other type definitions
const COMPONENT_DISPLAY_NAMES: Record<ComponentType, string> = {
  gpu: 'Graphics Card',
  cpu: 'Processor',
  motherboard: 'Motherboard',
  ram: 'Memory (RAM)'
};

// Add this type and constant for budget ranges
type BudgetRange = {
  label: string;
  value: number;
};

const BUDGET_RANGES: BudgetRange[] = [
  { label: 'Budget Build (Below ₹50,000)', value: 50000 },
  { label: 'Mid Range (Below ₹1,00,000)', value: 100000 },
  { label: 'High End (Below ₹1,50,000)', value: 150000 },
  { label: 'Premium (Below ₹2,00,000)', value: 200000 },
  { label: 'Ultra Premium (₹2,00,000+)', value: 250000 },
];

const MIN_BUDGET = 5000;  // Add this constant at the top with other constants

// Add this constant with the build purposes
const BUILD_PURPOSES: BuildPurpose[] = [
  {
    id: 'casual',
    name: 'Casual Build',
    description: 'For everyday computing, web browsing, and light office work',
    minBudget: 30000,
    maxBudget: 100000,
    icon: <FiMonitor className="w-5 h-5" /> // You'll need to import FiMonitor
  },
  {
    id: 'gaming',
    name: 'Gaming Build',
    description: 'For high-performance gaming and streaming',
    minBudget: 35000,
    maxBudget: 200000,
    icon: <FiPlay className="w-5 h-5" /> // You'll need to import FiPlay
  },
  {
    id: 'mining',
    name: 'Mining Rig',
    description: 'Optimized for cryptocurrency mining',
    minBudget: 200000,
    maxBudget: 500000,
    icon: <FiCpu className="w-5 h-5" /> // You'll need to import FiCpu
  },
  {
    id: 'workstation',
    name: 'Workstation Build',
    description: 'For professional work, content creation, and development',
    minBudget: 15000,
    maxBudget: 80000,
    icon: <FiCode className="w-5 h-5" /> // You'll need to import FiCode
  },
  {
    id: 'rendering',
    name: 'Rendering Station',
    description: '3D rendering, video editing, and heavy computational tasks',
    minBudget: 150000,
    maxBudget: 400000,
    icon: <FiFilm className="w-5 h-5" /> // You'll need to import FiFilm
  }
];

// Add this near your other constants
const CUSTOM_BUDGET_CHIPS = [
  { value: 45000, label: '₹45,000' },
  { value: 70000, label: '₹70,000' },
  { value: 85000, label: '₹85,000' },
  { value: 110000, label: '₹1,10,000' },
  { value: 125000, label: '₹1,25,000' },
  { value: 150000, label: '₹1,50,000' },
  { value: 175000, label: '₹1,75,000' },
  { value: 200000, label: '₹2,00,000' },
  { value: 250000, label: '₹2,50,000' },
];

// Add this constant for flexibility options
const BUDGET_FLEXIBILITY_OPTIONS = [
  {
    id: 'strict',
    label: 'Strict Budget',
    description: 'Must stay within the selected budget',
    icon: <FiLock className="w-5 h-5" />
  },
  {
    id: 'flexible',
    label: 'Somewhat Flexible',
    description: 'Can extend 10-15% above if needed',
    icon: <FiUnlock className="w-5 h-5" />
  },
  {
    id: 'very_flexible',
    label: 'Very Flexible',
    description: 'Performance is priority over budget',
    icon: <FiMaximize2 className="w-5 h-5" />
  }
];

// Add this type for component recommendations
type ComponentRecommendation = {
  type: ComponentType;
  minPrice: number;
  maxPrice: number;
  percentage: number; // Percentage of budget to allocate
  priority: number; // 1 is highest priority
};

// Add recommended component allocations for each build purpose
const PURPOSE_RECOMMENDATIONS: Record<string, ComponentRecommendation[]> = {
  gaming: [
    { type: 'gpu', minPrice: 35000, maxPrice: 50000, percentage: 40, priority: 1 }, // 40% of budget
    { type: 'cpu', minPrice: 20000, maxPrice: 35000, percentage: 25, priority: 2 }, // 25% of budget
    { type: 'motherboard', minPrice: 8000, maxPrice: 15000, percentage: 15, priority: 3 }, // 15% of budget
    { type: 'ram', minPrice: 5000, maxPrice: 10000, percentage: 10, priority: 4 }, // 10% of budget
  ],
  casual: [
    { type: 'cpu', minPrice: 15000, maxPrice: 25000, percentage: 35, priority: 1 },
    { type: 'gpu', minPrice: 15000, maxPrice: 25000, percentage: 25, priority: 2 },
    { type: 'motherboard', minPrice: 5000, maxPrice: 10000, percentage: 20, priority: 3 },
    { type: 'ram', minPrice: 3000, maxPrice: 8000, percentage: 20, priority: 4 },
  ],
  workstation: [
    { type: 'cpu', minPrice: 25000, maxPrice: 40000, percentage: 35, priority: 1 },
    { type: 'ram', minPrice: 10000, maxPrice: 20000, percentage: 25, priority: 2 },
    { type: 'motherboard', minPrice: 10000, maxPrice: 20000, percentage: 20, priority: 3 },
    { type: 'gpu', minPrice: 20000, maxPrice: 30000, percentage: 15, priority: 4 },
  ],
  // Add other purposes...
};

// Keep this type definition outside
type RecommendationWithComponents = ComponentRecommendation & {
  components: PCComponent[];
};

export default function PcBuilderScreen() {
  // Convert our data to the PCComponent format
  const availableComponents: PCComponent[] = [
    ...graphicsCards.map(card => ({
      id: card.id,
      name: card.name,
      price: card.price,
      company: card.company,
      type: 'gpu' as ComponentType,
      image: card.image
    })),
    ...processors.map(cpu => ({
      id: cpu.id,
      name: cpu.name,
      price: cpu.price,
      company: cpu.company,
      type: 'cpu' as ComponentType,
      image: cpu.image
    })),
    ...motherboards.map((mb, index) => ({
      id: `mb-${index + 1}`,  // Generate ID using index
      name: mb.name,
      price: mb.price,
      company: mb.company,
      type: 'motherboard' as ComponentType,
      image: mb.image
    })),
    ...ramModules.map((ram, index) => ({
      id: `ram-${index + 1}`,  // Generate ID using index
      name: ram.name,
      price: ram.price,
      company: ram.company,
      type: 'ram' as ComponentType,
      image: ram.image
    }))
  ];

  const [builds, setBuilds] = useState<PCBuild[]>([]);

  const { favorites, toggleFavorite } = useFavorites();

  const [editingBuildId, setEditingBuildId] = useState<string | null>(null);
  const [editingBuildName, setEditingBuildName] = useState('');

  const { showDialog } = useDialog();

  const [expandedCategories, setExpandedCategories] = useState<CategoryState>({
    gpu: true,
    cpu: false,
    motherboard: false,
    ram: false
  });

  const toggleCategory = (category: ComponentType) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleDragEnd = (result: DragDropResult) => {
    if (!result.destination) return;

    const { destination, draggableId } = result;

    // Handle dropping component into a build
    if (destination.droppableId.startsWith('build-')) {
      const originalId = draggableId.startsWith('fav-') ? draggableId.slice(4) : draggableId;
      
      const component = availableComponents.find(c => c.id === originalId);
      if (!component) return;

      const buildIndex = builds.findIndex(b => b.id === destination.droppableId);
      if (buildIndex === -1) return;

      const updatedBuilds = [...builds];
      const build = updatedBuilds[buildIndex];
      
      // Calculate new total if this component is added
      const existingComponent = build.components[component.type as keyof typeof build.components];
      const newTotal = calculateBuildPrice(build) - (existingComponent?.price || 0) + component.price;

      // Check if new total exceeds budget
      if (newTotal > build.budget) {
        showDialog({
          type: 'confirm',
          title: 'Budget Exceeded',
          message: (
            <div className="space-y-4">
              <p>Adding this component will exceed your budget by ₹{(newTotal - build.budget).toLocaleString()}.</p>
              <p>Would you like to:</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    // Increase budget
                    setBuilds(prev => prev.map(b => 
                      b.id === build.id 
                        ? { ...b, budget: newTotal }
                        : b
                    ));
                    // Add component
                    build.components[component.type as keyof typeof build.components] = component;
                    setBuilds(updatedBuilds);
                  }}
                  className="w-full text-left px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Increase budget to ₹{newTotal.toLocaleString()}
                </button>
                <button
                  onClick={() => {
                    // Add component without increasing budget
                    build.components[component.type as keyof typeof build.components] = component;
                    setBuilds(updatedBuilds);
                  }}
                  className="w-full text-left px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Continue without budget restriction (Estimate total cost)
                </button>
                <button
                  onClick={() => {
                    // Do nothing, keep current state
                  }}
                  className="w-full text-left px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                >
                  Cancel and maintain current budget
                </button>
              </div>
            </div>
          )
        });
        return;
      }

      // If component type already exists in build
      if (build.components[component.type as keyof typeof build.components]) {
        const existingComponent = build.components[component.type as keyof typeof build.components];
        showDialog({
          type: 'confirm',
          title: 'Replace Component',
          message: `Do you want to replace "${existingComponent?.name}" with "${component.name}"?`,
          onConfirm: () => {
            build.components[component.type as keyof typeof build.components] = component;
            setBuilds(updatedBuilds);
            showDialog({
              type: 'success',
              title: 'Component Replaced',
              message: `Successfully replaced with ${component.name} in ${build.name}`
            });
          }
        });
        return;
      }

      // Add component to build if there's no existing component
      build.components[component.type as keyof typeof build.components] = component;
      setBuilds(updatedBuilds);
      
      showDialog({
        type: 'success',
        title: 'Component Added',
        message: `${COMPONENT_DISPLAY_NAMES[component.type]} "${component.name}" has been added to ${build.name}`
      });
    }
  };

  const addNewBuild = () => {
    showDialog({
      type: 'confirm',
      title: 'Select Build Purpose',
      message: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Choose the primary purpose for your PC build:
          </p>
          <div className="space-y-3">
            {BUILD_PURPOSES.map((purpose) => (
              <button
                key={purpose.id}
                onClick={() => showBudgetSelection(purpose)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg 
                  bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                  dark:hover:bg-gray-600 transition-colors"
              >
                <div className="text-gray-600 dark:text-gray-300">
                  {purpose.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {purpose.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Estimated: ₹{purpose.minBudget.toLocaleString()} - 
                    {purpose.maxBudget ? `₹${purpose.maxBudget.toLocaleString()}` : 'Above'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    });
  };

  const startEditingBuildName = (buildId: string, currentName: string) => {
    setEditingBuildId(buildId);
    setEditingBuildName(currentName);
  };

  const saveBuildName = () => {
    if (!editingBuildId) return;
    
    setBuilds(prev => prev.map(build => 
      build.id === editingBuildId 
        ? { ...build, name: editingBuildName }
        : build
    ));
    
    setEditingBuildId(null);
    setEditingBuildName('');
  };

  const calculateBuildPrice = (build: PCBuild) => {
    return Object.values(build.components).reduce((total, component) => {
      return total + (component?.price || 0);
    }, 0);
  };

  const handleComponentRemove = (buildId: string, componentType: ComponentType) => {
    showDialog({
      type: 'confirm',
      title: 'Remove Component',
      message: `Are you sure you want to remove this ${COMPONENT_DISPLAY_NAMES[componentType].toLowerCase()} from your build?`,
      onConfirm: () => {
        setBuilds(prev => prev.map(build => {
          if (build.id === buildId) {
            const updatedComponents = { ...build.components };
            delete updatedComponents[componentType];
            return { ...build, components: updatedComponents };
          }
          return build;
        }));
      }
    });
  };

  const handleBuildDelete = (buildId: string, buildName: string) => {
    showDialog({
      type: 'confirm',
      title: 'Delete Build',
      message: `Are you sure you want to delete "${buildName}"? This action cannot be undone.`,
      onConfirm: () => {
        setBuilds(prev => prev.filter(build => build.id !== buildId));
      }
    });
  };

  const componentsByType = availableComponents.reduce((acc, component) => {
    if (!acc[component.type]) {
      acc[component.type] = [];
    }
    acc[component.type].push(component);
    return acc;
  }, {} as Record<ComponentType, PCComponent[]>);

  // Add this new state for budget editing
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingBudgetValue, setEditingBudgetValue] = useState<number>(0);

  // Add these new functions
  const startEditingBudget = (buildId: string, currentBudget: number) => {
    setEditingBudgetId(buildId);
    setEditingBudgetValue(currentBudget);
  };

  const saveBudget = () => {
    if (!editingBudgetId) return;
    
    if (editingBudgetValue < MIN_BUDGET) {
      showDialog({
        type: 'error',
        title: 'Invalid Budget',
        message: `Budget cannot be less than ₹${MIN_BUDGET.toLocaleString()}. Please enter a higher amount.`
      });
      return;
    }
    
    setBuilds(prev => prev.map(build => 
      build.id === editingBudgetId 
        ? { ...build, budget: editingBudgetValue }
        : build
    ));
    
    setEditingBudgetId(null);
  };

  // Modify the handleCustomBudget function
  const handleCustomBudget = (purpose: BuildPurpose) => {
    console.log('Opening custom budget dialog');

    const handleCreateBuild = (budgetValue: number) => {
      console.log('Creating build with budget:', budgetValue);
      setBuilds(prev => [...prev, {
        id: `build-${prev.length + 1}`,
        name: `${purpose.name} ${prev.length + 1}`,
        budget: budgetValue,
        purpose: purpose.id,
        budgetFlexibility: 'strict',
        components: {}
      }]);

      showDialog({
        type: 'success',
        title: 'Build Created',
        message: `Created new ${purpose.name.toLowerCase()} with budget: ₹${budgetValue.toLocaleString()}`
      });
    };

    showDialog({
      type: 'confirm',
      title: 'Select Custom Budget',
      message: (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            {purpose.icon}
            <div>
              <h3 className="font-medium text-lg">{purpose.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {purpose.description}
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Recommended range for {purpose.name.toLowerCase()}:
              <br />₹{purpose.minBudget.toLocaleString()} - 
              {purpose.maxBudget ? `₹${purpose.maxBudget.toLocaleString()}` : 'Above'}
            </p>
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Select your preferred budget:
            </p>
            <div className="flex flex-wrap gap-2">
              {CUSTOM_BUDGET_CHIPS.map((chip) => {
                const isWithinRange = chip.value >= purpose.minBudget && 
                  (!purpose.maxBudget || chip.value <= purpose.maxBudget);
                
                return (
                  <button
                    key={chip.value}
                    onClick={() => {
                      if (!isWithinRange) {
                        showDialog({
                          type: 'confirm',
                          title: 'Budget Outside Recommended Range',
                          message: (
                            <div className="space-y-3">
                              <p>The selected budget is {chip.value < purpose.minBudget ? 'below' : 'above'} 
                                the recommended range for a {purpose.name.toLowerCase()}.</p>
                              <p>Would you like to continue anyway?</p>
                              <div className="space-y-2">
                                <button
                                  onClick={() => handleCreateBuild(chip.value)}
                                  className="w-full text-left px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                  Continue with {chip.label}
                                </button>
                                <button
                                  onClick={() => {
                                    // Go back to budget selection
                                  }}
                                  className="w-full text-left px-4 py-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
                                >
                                  Select different budget
                                </button>
                              </div>
                            </div>
                          )
                        });
                        return;
                      }
                      handleCreateBuild(chip.value);
                    }}
                    className={`px-4 py-2 rounded-full transition-colors
                      ${isWithinRange 
                        ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}
                    `}
                  >
                    {chip.label}
                    {isWithinRange && (
                      <span className="ml-1 text-xs text-green-500">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )
    });
  };

  const showBudgetSelection = (purpose: BuildPurpose) => {
    showDialog({
      type: 'confirm',
      title: 'Budget Flexibility',
      message: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            How flexible is your budget for this {purpose.name.toLowerCase()}?
          </p>
          <div className="space-y-3">
            {BUDGET_FLEXIBILITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  // After selecting flexibility, show budget options
                  showDialog({
                    type: 'confirm',
                    title: `Select Budget for ${purpose.name}`,
                    message: (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          {purpose.icon}
                          <div>
                            <h3 className="font-medium text-lg">{purpose.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {purpose.description}
                            </p>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {option.icon}
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                              {option.label}
                            </span>
                          </div>
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {option.description}
                          </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Recommended range for {purpose.name.toLowerCase()}:
                            <br />₹{purpose.minBudget.toLocaleString()} - 
                            {purpose.maxBudget ? `₹${purpose.maxBudget.toLocaleString()}` : 'Above'}
                          </p>
                        </div>

                        <div className="pt-2">
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            Select your preferred budget range:
                          </p>
                          <div className="space-y-2">
                            {BUDGET_RANGES.map((range) => (
                              <button
                                key={range.value}
                                onClick={() => {
                                  setBuilds(prev => [...prev, {
                                    id: `build-${prev.length + 1}`,
                                    name: `${purpose.name} ${prev.length + 1}`,
                                    budget: range.value,
                                    purpose: purpose.id,
                                    budgetFlexibility: option.id as BudgetFlexibility,
                                    components: {}
                                  }]);
                                  showDialog({
                                    type: 'success',
                                    title: 'Build Created',
                                    message: `Created new ${purpose.name.toLowerCase()} with ${option.label.toLowerCase()} budget of ₹${range.value.toLocaleString()}`
                                  });
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg
                                  ${range.value >= purpose.minBudget && (!purpose.maxBudget || range.value <= purpose.maxBudget)
                                    ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}
                                  transition-colors text-gray-800 dark:text-gray-200`}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{range.label}</span>
                                  {(range.value >= purpose.minBudget && (!purpose.maxBudget || range.value <= purpose.maxBudget)) && (
                                    <span className="text-green-500 text-sm">Recommended</span>
                                  )}
                                </div>
                              </button>
                            ))}
                            
                            {/* Add custom budget option */}
                            <button
                              onClick={() => handleCustomBudget(purpose)}
                              className="w-full text-left px-4 py-3 rounded-lg
                                bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                                transition-colors text-gray-800 dark:text-gray-200 mt-4"
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">Custom Budget</span>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Choose from preset amounts or enter your own
                                  </p>
                                </div>
                                <FiEdit2 className="w-5 h-5 text-blue-500" />
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  });
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg 
                  bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                  dark:hover:bg-gray-600 transition-colors"
              >
                <div className="text-gray-600 dark:text-gray-300">
                  {option.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">
                    {option.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )
    });
  };

  // Move getRecommendedComponents inside the component
  const getRecommendedComponents = (build: PCBuild): RecommendationWithComponents[] => {
    const recommendations = PURPOSE_RECOMMENDATIONS[build.purpose] || [];
    const budget = build.budget;
    
    return recommendations.map(rec => {
      const targetPrice = (budget * rec.percentage) / 100;
      const tolerance = build.budgetFlexibility === 'strict' ? 0.1 : 
                       build.budgetFlexibility === 'flexible' ? 0.2 : 0.3;
      
      const minPrice = targetPrice * (1 - tolerance);
      const maxPrice = targetPrice * (1 + tolerance);
      
      const recommendedComponents = availableComponents.filter((comp: PCComponent) => 
        comp.type === rec.type && 
        comp.price >= minPrice && 
        comp.price <= maxPrice
      );

      return {
        ...rec,
        components: recommendedComponents,
      };
    });
  };

  // Move getRecommendationStatus inside as well
  const getRecommendationStatus = (type: ComponentType, build: PCBuild) => {
    const recommendations = getRecommendedComponents(build);
    const recommendation = recommendations.find((rec: RecommendationWithComponents) => rec.type === type);
    
    if (!recommendation) return null;
    
    return {
      hasRecommendations: recommendation.components.length > 0,
      count: recommendation.components.length,
      percentage: recommendation.percentage,
      targetBudget: (build.budget * recommendation.percentage) / 100
    };
  };

  return (
    <div className="min-h-screen w-full pt-20 pb-16 bg-[#111827]">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 px-6 pt-4">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0 flex flex-col h-[calc(100vh-6rem)] space-y-4">
            {/* Available Components Section */}
            <div className="flex-1 bg-[#1F2937] rounded-xl overflow-hidden flex flex-col">
              <div className="py-4 px-6 border-b border-gray-700 bg-[#1F2937] sticky top-0 z-10">
                <h2 className="font-bold text-white text-xl">AVAILABLE COMPONENTS</h2>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <Droppable droppableId="components">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {Object.entries(componentsByType).map(([type, components]) => (
                        <div key={type} className="bg-[#2D3748] rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleCategory(type as ComponentType)}
                            className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-[#374151] transition-colors relative"
                          >
                            <span className="font-medium flex items-center gap-2">
                              {COMPONENT_DISPLAY_NAMES[type as ComponentType]}
                              {builds.map(build => {
                                const status = getRecommendationStatus(type as ComponentType, build);
                                if (status?.hasRecommendations) {
                                  return (
                                    <span key={build.id} className="flex items-center">
                                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                      <span className="ml-2 text-xs text-green-400">
                                        {status.count} recommended
                                      </span>
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </span>
                            {expandedCategories[type as ComponentType] ? (
                              <FiChevronDown className="w-5 h-5" />
                            ) : (
                              <FiChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          
                          <div className={`
                            overflow-hidden transition-all duration-200 ease-in-out
                            ${expandedCategories[type as ComponentType] ? 'max-h-[1000px]' : 'max-h-0'}
                          `}>
                            {builds.length > 0 && (
                              <div className="px-4 py-2 bg-gray-800">
                                {builds.map(build => {
                                  const status = getRecommendationStatus(type as ComponentType, build);
                                  if (status?.hasRecommendations) {
                                    return (
                                      <div key={build.id} className="text-sm text-gray-400">
                                        <p className="flex items-center gap-2">
                                          <span className="w-2 h-2 rounded-full bg-green-500" />
                                          For {build.name}:
                                        </p>
                                        <p className="ml-4">
                                          Budget allocation: ₹{Math.round(status.targetBudget).toLocaleString()} ({status.percentage}%)
                                        </p>
                                        <p className="ml-4">
                                          {status.count} compatible options found
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            )}
                            <div className="space-y-2 p-2">
                              {components.map((component, index) => (
                                <Draggable
                                  key={component.id}
                                  draggableId={component.id}
                                  index={index}
                                >
                                  {(provided) => {
                                    const isRecommended = builds.some(build => {
                                      const recommendations = getRecommendedComponents(build);
                                      return recommendations.some(rec => 
                                        rec.components.some((c: PCComponent) => c.id === component.id)
                                      );
                                    });

                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`bg-[#374151] p-3 rounded-lg relative group
                                          ${isRecommended ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}
                                        `}
                                      >
                                        {isRecommended && (
                                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                            Recommended
                                          </div>
                                        )}
                                        <button
                                          onClick={() => toggleFavorite(component)}
                                          className={`absolute right-2 top-2 p-1 rounded-full 
                                            ${favorites.some(c => c.id === component.id)
                                              ? 'text-red-500'
                                              : 'text-gray-400 opacity-0 group-hover:opacity-100'
                                            }`}
                                        >
                                          <FiHeart />
                                        </button>
                                        <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 relative">
                                            <Image
                                              src={component.image || '/images/placeholder.jpg'}
                                              alt={component.name}
                                              fill
                                              className="object-contain"
                                            />
                                          </div>
                                          <div>
                                            <p className="font-medium text-sm text-white">{component.name}</p>
                                            <p className="text-sm text-gray-400">
                                              ₹{component.price.toLocaleString()}
                                            </p>
                                            {isRecommended && (
                                              <p className="text-xs text-green-400 mt-1">
                                                Perfect match for your build
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>

            {/* Favorites Section */}
            <div className="flex-1 bg-[#1F2937] rounded-xl overflow-hidden flex flex-col">
              <div className="py-4 px-6 border-b border-gray-700 bg-[#1F2937] sticky top-0 z-10">
                <h2 className="font-bold text-white text-xl">FAVORITE COMPONENTS</h2>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <Droppable droppableId="favorites">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {favorites.map((component, index) => (
                        <Draggable
                          key={component.id}
                          draggableId={`fav-${component.id}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg relative group"
                            >
                              <button
                                onClick={() => toggleFavorite(component)}
                                className="absolute right-2 top-2 p-1 rounded-full text-red-500"
                              >
                                <FiHeart />
                              </button>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 relative">
                                  <Image
                                    src={component.image || '/images/placeholder.jpg'}
                                    alt={component.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{component.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    ₹{component.price}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>

          {/* Main Content - PC Builds */}
          <div className="flex-1 flex flex-col">
            <div className="bg-[#1F2937] p-4 rounded-xl mb-6 sticky top-20 z-10">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">PC Builds</h1>
                <button
                  onClick={addNewBuild}
                  className="bg-white text-black px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100"
                >
                  <FiPlus /> New Build
                </button>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6">
              {builds.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-[#1F2937] rounded-xl p-12">
                  <div className="w-24 h-24 mb-6 text-gray-400">
                    {/* You can replace this with an actual illustration/image if you have one */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No PC Builds Yet</h3>
                  <p className="text-gray-400 text-center mb-6">
                    Start creating your custom PC build by clicking the New Build button
                  </p>
                  <button
                    onClick={addNewBuild}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FiPlus /> Create Your First Build
                  </button>
                </div>
              ) : (
                builds.map((build) => (
                  <div
                    key={build.id}
                    className="bg-[#1F2937] rounded-xl p-6 min-w-[350px]"
                  >
                    <div className="flex justify-between items-center mb-6">
                      {editingBuildId === build.id ? (
                        <input
                          type="text"
                          value={editingBuildName}
                          onChange={(e) => setEditingBuildName(e.target.value)}
                          onBlur={saveBuildName}
                          onKeyPress={(e) => e.key === 'Enter' && saveBuildName()}
                          className="text-xl font-bold bg-transparent border-b border-gray-600 focus:outline-none focus:border-blue-500 text-white"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-white">{build.name}</h2>
                          <button
                            onClick={() => startEditingBuildName(build.id, build.name)}
                            className="p-1 text-gray-400 hover:text-gray-300"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleBuildDelete(build.id, build.name)}
                            className="p-1 text-gray-400 hover:text-gray-300"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          {editingBudgetId === build.id ? (
                            <input
                              type="number"
                              min={MIN_BUDGET}
                              value={editingBudgetValue}
                              onChange={(e) => {
                                const value = Math.max(0, parseInt(e.target.value) || 0);
                                setEditingBudgetValue(value);
                              }}
                              onBlur={saveBudget}
                              onKeyPress={(e) => e.key === 'Enter' && saveBudget()}
                              className="w-32 px-2 py-1 text-sm bg-transparent border-b border-gray-600 
                                focus:outline-none focus:border-blue-500 text-white text-right"
                              placeholder={`Min ₹${MIN_BUDGET.toLocaleString()}`}
                              autoFocus
                            />
                          ) : (
                            <>
                              <span className="text-sm text-gray-400">
                                Budget: ₹{build.budget.toLocaleString()}
                              </span>
                              <button
                                onClick={() => startEditingBudget(build.id, build.budget)}
                                className="p-1 text-gray-400 hover:text-gray-300"
                              >
                                <FiEdit2 size={12} />
                              </button>
                            </>
                          )}
                        </div>
                        <p className={`text-lg font-medium ${
                          calculateBuildPrice(build) > build.budget 
                            ? 'text-red-500' 
                            : 'text-white'
                        }`}>
                          Total: ₹{calculateBuildPrice(build).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <Droppable droppableId={build.id}>
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {['gpu', 'cpu', 'motherboard', 'ram'].map((type) => (
                            <div
                              key={type}
                              className={`
                                border-2 border-dashed rounded-xl p-4
                                ${snapshot.isDraggingOver && !build.components[type as ComponentType]
                                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-gray-200 dark:border-gray-700'}
                                ${build.components[type as ComponentType]
                                  ? 'border-solid border-green-400 dark:border-green-600'
                                  : ''}
                              `}
                            >
                              <p className="text-sm font-medium mb-2 capitalize">{type}</p>
                              {build.components[type as ComponentType] ? (
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg relative group">
                                  <button
                                    onClick={() => handleComponentRemove(build.id, type as ComponentType)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 relative">
                                      <Image
                                        src={build.components[type as ComponentType]?.image || '/images/placeholder.jpg'}
                                        alt={build.components[type as ComponentType]?.name || ''}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {build.components[type as ComponentType]?.name}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        ₹{build.components[type as ComponentType]?.price.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">
                                  Drag and drop a {COMPONENT_DISPLAY_NAMES[type as ComponentType].toLowerCase()} here
                                </p>
                              )}
                            </div>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
