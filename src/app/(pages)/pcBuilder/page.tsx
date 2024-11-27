"use client";
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { graphicsCards } from '../../../../data/PC.GRAPHICCARDS';
import { processors } from '../../../../data/PC.PROCESSORS';
import { motherboards } from '../../../../data/PC.MOTHERBOARDS';
import { ramModules } from '../../../../data/PC.RAM';
import Image from 'next/image';
import { FiEdit2, FiHeart, FiPlus } from 'react-icons/fi';

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
    ...motherboards.map(mb => ({
      id: `motherboard-${mb.name}`,
      name: mb.name,
      price: mb.price,
      company: mb.company,
      type: 'motherboard' as ComponentType,
      image: mb.image
    })),
    ...ramModules.map(ram => ({
      id: `ram-${ram.name}`,
      name: ram.name,
      price: ram.price,
      company: ram.company,
      type: 'ram' as ComponentType,
      image: ram.image
    }))
  ];

  const [builds, setBuilds] = useState<PCBuild[]>([
    {
      id: 'build-1',
      name: 'Gaming PC',
      components: {}
    }
  ]);

  const [favoriteComponents, setFavoriteComponents] = useState<PCComponent[]>([]);
  const [editingBuildId, setEditingBuildId] = useState<string | null>(null);
  const [editingBuildName, setEditingBuildName] = useState('');

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

  const toggleFavorite = (component: PCComponent) => {
    setFavoriteComponents(prev => {
      const exists = prev.find(c => c.id === component.id);
      if (exists) {
        return prev.filter(c => c.id !== component.id);
      }
      return [...prev, component];
    });
  };

  const addNewBuild = () => {
    setBuilds(prev => [...prev, {
      id: `build-${prev.length + 1}`,
      name: `New Build ${prev.length + 1}`,
      components: {}
    }]);
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
                              className="bg-[#374151] p-3 rounded-lg relative group"
                            >
                              <button
                                onClick={() => toggleFavorite(component)}
                                className={`absolute right-2 top-2 p-1 rounded-full 
                                  ${favoriteComponents.some(c => c.id === component.id)
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
                      {favoriteComponents.map((component, index) => (
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
              {builds.map((build) => (
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
                      </div>
                    )}
                    <p className="text-lg font-medium text-white">
                      Total: ${calculateBuildPrice(build)}
                    </p>
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
