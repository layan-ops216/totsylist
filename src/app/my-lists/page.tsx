"use client";
import { useState, useEffect } from "react";
import { listStore } from "@/app/lib/listStore";
import { UserList } from "@/app/types/userLists";
import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";

export default function MyListsPage() {
  const [lists, setLists] = useState<UserList[]>([]);

  useEffect(() => {
    setLists(listStore.getLists());
    const unsubscribe = listStore.subscribe(() => {
      setLists(listStore.getLists());
    });
    return unsubscribe;
  }, []);

  const handleDeleteList = (id: string) => {
    if (confirm('Are you sure you want to delete this list?')) {
      listStore.deleteList(id);
    }
  };

  const copyShareLink = (shareCode: string) => {
    const url = `${window.location.origin}/shared/${shareCode}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0">
        <div className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-4xl px-6 py-8 lg:ml-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Lists</h1>
            <p className="text-gray-600">Manage your saved baby product lists</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-8 lg:ml-8">
          {lists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lists yet</h3>
              <p className="text-gray-500 mb-4">Create your first TotsyList to get started</p>
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create New List
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lists.map((list) => (
                <div key={list.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{list.name}</h3>
                    <div className="flex gap-2">
                      {list.isPublic && list.shareCode && (
                        <button
                          onClick={() => copyShareLink(list.shareCode!)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Copy share link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete list"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {list.description && (
                    <p className="text-sm text-gray-600 mb-3">{list.description}</p>
                  )}
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <p>{list.items.length} items</p>
                    <p>Created {new Date(list.createdAt).toLocaleDateString()}</p>
                    {list.isPublic && <p className="text-green-600">Public</p>}
                  </div>
                  
                  <Link
                    href={`/my-lists/${list.id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View List
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
