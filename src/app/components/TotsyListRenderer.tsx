"use client";
import { useState, useEffect } from "react";
import type { TotsyListResponse, CategoryBlock, ProductItem } from "@/app/types/totsylist";
import { listStore } from "@/app/lib/listStore";
import { UserList } from "@/app/types/userLists";

export default function TotsyListRenderer({ data }: { data: TotsyListResponse | null }) {
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [loadingAlternatives, setLoadingAlternatives] = useState<Set<string>>(new Set());
  const [loadingExplanations, setLoadingExplanations] = useState<Set<string>>(new Set());
  const [showListModal, setShowListModal] = useState<{
    isOpen: boolean;
    item: ProductItem | null;
  }>({ isOpen: false, item: null });
  const [explanationModal, setExplanationModal] = useState<{
    isOpen: boolean;
    product: ProductItem | null;
    explanation: string;
  }>({ isOpen: false, product: null, explanation: "" });
  const [userLists, setUserLists] = useState<UserList[]>([]);
  const [newListName, setNewListName] = useState("");

  useEffect(() => {
    setUserLists(listStore.getLists());
    const unsubscribe = listStore.subscribe(() => {
      setUserLists(listStore.getLists());
    });
    return unsubscribe;
  }, []);

  if (!data) {
    return (
      <div className="bg-white border border-gray-200 rounded p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your TotsyList will appear here</h3>
        <p className="text-gray-600">Describe your needs in the form to get started</p>
      </div>
    );
  }

  const { summary, categories } = data;

  const handleAddToList = (item: ProductItem) => {
    setShowListModal({ isOpen: true, item });
  };

  const handleAddToExistingList = (listId: string) => {
    if (showListModal.item) {
      listStore.addItemToList(listId, {
        name: showListModal.item.name,
        brand: showListModal.item.brand,
        why: showListModal.item.why,
        eco_friendly: showListModal.item.eco_friendly,
        est_price_usd: showListModal.item.est_price_usd,
        url: showListModal.item.url
      });
      
      setAddedItems(prev => new Set([...prev, showListModal.item!.name]));
      setShowListModal({ isOpen: false, item: null });
    }
  };

  const handleCreateNewList = () => {
    if (newListName.trim() && showListModal.item) {
      const listId = listStore.addList({
        name: newListName.trim(),
        description: `Created from TotsyList generation`,
        items: [],
        isPublic: false,
        author: 'User'
      });
      
      listStore.addItemToList(listId, {
        name: showListModal.item.name,
        brand: showListModal.item.brand,
        why: showListModal.item.why,
        eco_friendly: showListModal.item.eco_friendly,
        est_price_usd: showListModal.item.est_price_usd,
        url: showListModal.item.url
      });
      
      setAddedItems(prev => new Set([...prev, showListModal.item!.name]));
      setShowListModal({ isOpen: false, item: null });
      setNewListName("");
    }
  };

  const handleGetAlternative = async (item: ProductItem, category: string) => {
    const itemKey = `${category}-${item.name}`;
    setLoadingAlternatives(prev => new Set([...prev, itemKey]));
    
    setTimeout(() => {
      setLoadingAlternatives(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
      console.log("Getting alternative for:", item.name);
    }, 1500);
  };

  const handleGoogleSearch = (productName: string, brand?: string) => {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(productName)}`;
    window.open(googleUrl, '_blank');
  };

  const handleExplainRecommendation = async (item: ProductItem, category: string) => {
    const itemKey = `${category}-${item.name}`;
    setLoadingExplanations(prev => new Set([...prev, itemKey]));
    
    try {
      const response = await fetch("/api/explain-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: item.name,
          brand: item.brand,
          category: category,
          userInput: (data as any)?.originalInput || "User requested baby product recommendations",
          why: item.why
        })
      });
      
      const result = await response.json();
      
      setExplanationModal({
        isOpen: true,
        product: item,
        explanation: result.explanation
      });
      
    } catch (error) {
      console.error("Error getting explanation:", error);
      setExplanationModal({
        isOpen: true,
        product: item,
        explanation: "I recommended this product based on your specific needs and preferences. It offers good quality and value for your situation."
      });
    } finally {
      setLoadingExplanations(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="bg-white border border-gray-200 rounded p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Shopping List</h2>
        <div>
          <span className="text-sm text-gray-600">Activity: </span>
          <span className="text-sm text-gray-900">{summary.due_date}</span>
        </div>
        {summary.disclaimers?.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
            {summary.disclaimers.map((d, i) => <div key={i}>• {d}</div>)}
          </div>
        )}
      </div>

      {/* Categories Section */}
      {categories?.length > 0 && (
        <div className="space-y-6">
          {categories.map((cat: CategoryBlock, idx: number) => (
            <div key={idx} className="bg-white border border-gray-200 rounded mb-6">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{cat.category}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    cat.priority === 'essential' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {cat.priority.replace("_", " ")}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                {cat.items.map((item: ProductItem, i: number) => {
                  const itemKey = `${cat.category}-${item.name}`;
                  const isAdded = addedItems.has(item.name);
                  const isLoadingAlt = loadingAlternatives.has(itemKey);
                  const isLoadingExplanation = loadingExplanations.has(itemKey);
                  
                  return (
                    <div key={i} className="border-b border-gray-100 py-4 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            {item.brand && (
                              <span className="text-sm text-gray-500">by {item.brand}</span>
                            )}
                            {item.eco_friendly && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Eco-Friendly
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{item.why}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            {typeof item.est_price_usd === "number" && (
                              <span className="font-medium text-gray-900">
                                ${item.est_price_usd.toFixed(2)}
                              </span>
                            )}
                            <button
                              onClick={() => handleGoogleSearch(item.name, item.brand)}
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Search Google
                            </button>
                          </div>
                        </div>
                        
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleAddToList(item)}
                              disabled={isAdded}
                              className={`px-3 py-1 rounded text-sm ${
                                isAdded
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isAdded ? '✓ Added' : 'Add'}
                            </button>
                            
                            <button
                              onClick={() => handleExplainRecommendation(item, cat.category)}
                              disabled={isLoadingExplanation}
                              className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                            >
                              {isLoadingExplanation ? '...' : 'Why?'}
                            </button>
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List Selection Modal */}
      {showListModal.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add "{showListModal.item?.name}" to List
                </h3>
                <button
                  onClick={() => setShowListModal({ isOpen: false, item: null })}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Create New List */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Create New List</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateNewList()}
                  />
                  <button
                    onClick={handleCreateNewList}
                    disabled={!newListName.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
              
              {/* Existing Lists */}
              {userLists.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Add to Existing List</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userLists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => handleAddToExistingList(list.id)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{list.name}</div>
                        <div className="text-sm text-gray-500">{list.items.length} items</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {explanationModal.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-lg border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Why I recommended: {explanationModal.product?.name}
                </h3>
                <button
                  onClick={() => setExplanationModal({ isOpen: false, product: null, explanation: "" })}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{explanationModal.explanation}</p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setExplanationModal({ isOpen: false, product: null, explanation: "" })}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
