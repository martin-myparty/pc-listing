"use client";
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { graphicsCards } from '../../../../data/PC.GRAPHICCARDS';
import { processors } from '../../../../data/PC.PROCESSORS';
import Image from 'next/image';

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

type PCBuild = {
  id: string;
  name: string;
  components: {
    gpu?: PCComponent;
    cpu?: PCComponent;
    motherboard?: PCComponent;
    ram?: PCComponent;
  };
};

// Add type for DragDropContext result
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

export default function PcBuilderScreen() {
  // Convert our data to the PCComponent format
  const availableComponents: PCComponent[] = [
    ...graphicsCards.map(card => ({
      id: `gpu-${card.name}`,
      name: card.name,
      price: card.price,
      company: card.company,
      type: 'gpu' as ComponentType,
      image: card.image
    })),
    ...processors.map(cpu => ({
      id: `cpu-${cpu.name}`,
      name: cpu.name,
      price: cpu.price,
      company: cpu.company,
      type: 'cpu' as ComponentType,
      image: cpu.image
    })),
    // Add other component types...
  ];

  const [builds, setBuilds] = useState<PCBuild[]>([
    {
      id: 'build-1',
      name: 'Gaming PC',
      components: {}
    }
  ]);
  
  const [showNewBuildDialog, setShowNewBuildDialog] = useState(false);
  const [newBuildName, setNewBuildName] = useState('');

  const handleDragEnd = (result: DragDropResult) => {
    if (!result.destination) return;

    const { destination, draggableId } = result;

    // Handle dropping component into a build
    if (destination.droppableId.startsWith('build-')) {
      const component = availableComponents.find(c => c.id === draggableId);
      if (!component) return;

      const buildIndex = builds.findIndex(b => b.id === destination.droppableId);
      if (buildIndex === -1) return;

      // Check if component type already exists in build
      const updatedBuilds = [...builds];
      const build = updatedBuilds[buildIndex];
      
      if (build.components[component.type as keyof typeof build.components]) {
        // Component type already exists - show error state
        return;
      }

      // Add component to build
      build.components[component.type as keyof typeof build.components] = component;
      setBuilds(updatedBuilds);
    }
  };

  const calculateBuildPrice = (build: PCBuild) => {
    return Object.values(build.components).reduce((total, component) => {
      return total + (component?.price || 0);
    }, 0);
  };

  const handleAddNewBuild = () => {
    if (!newBuildName.trim()) return;
    
    setBuilds(prev => [...prev, {
      id: `build-${prev.length + 1}`,
      name: newBuildName,
      components: {}
    }]);
    
    setNewBuildName('');
    setShowNewBuildDialog(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 max-w-7xl mx-auto px-4">
          {/* Left Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <h2 className="font-bold mb-4">Available Components</h2>
              <Droppable droppableId="components">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {availableComponents.map((component, index) => (
                      <Draggable
                        key={component.id}
                        draggableId={component.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg"
                          >
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
                                  ${component.price}
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

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">PC Builds</h1>
              {!showNewBuildDialog ? (
                <button
                  onClick={() => setShowNewBuildDialog(true)}
                  className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg"
                >
                  New Build
                </button>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBuildName}
                    onChange={(e) => setNewBuildName(e.target.value)}
                    placeholder="Build name"
                    className="px-3 py-2 rounded-lg border"
                  />
                  <button
                    onClick={handleAddNewBuild}
                    className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {builds.map((build) => (
                <div
                  key={build.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">{build.name}</h2>
                    <p className="text-lg font-medium">
                      Total: ${calculateBuildPrice(build)}
                    </p>
                  </div>
                  
                  <Droppable droppableId={build.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-2 gap-4"
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
                              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
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
                                      ${build.components[type as ComponentType]?.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">
                                Drag and drop a {type} here
                              </p>
                            )}
                          </div>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
