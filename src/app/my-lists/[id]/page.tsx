"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { listStore } from "@/app/lib/listStore";
import { UserList, SavedListItem } from "@/app/types/userLists";
import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";

export default function ListDetailPage() {
  const params = useParams();
  const [list, setList] = useState<UserList | null>(null);
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (params.id) {
      const foundList = listStore.getList(params.id as string);
      setList(foundList || null);
      
      const unsubscribe = listStore.subscribe(() => {
        const updatedList = listStore.getList(params.id as string);
        setList(updatedList || null);
      });
      
      return unsubscribe;
    }
  }, [params.id]);

  const handleVote = (itemId: string, vote: 'up' | 'down') => {
    if (list) {
      listStore.voteOnItem(list.id, itemId, vote);
    }
  };

  const handleAddComment = (itemId: string) => {
    const text = commentTexts[itemId]?.trim();
    if (text && list) {
      listStore.addComment(list.id, itemId, text, 'Anonymous User');
      setCommentTexts(prev => ({ ...prev, [itemId]: '' }));
    }
  };

  const copyShareLink = () => {
    if (list?.shareCode) {
      const url = `${window.location.origin}/shared/${list.shareCode}`;
      navigator.clipboard.writeText(url);
      alert('Share link copied to clipboard!');
    }
  };

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">List not found</h1>
            <Link href="/my-lists" className="text-blue-600 hover:underline">
              Back to My Lists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-0">
        <div className="bg-white border-b border-gray-200">
          <div className="mx-auto max-w-4xl px-6 py-8 lg:ml-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{list.name}</h1>
                {list.description && (
                  <p className="text-gray-600 mb-2">{list.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  {list.items.length} items • Created {new Date(list.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                {list.isPublic && list.shareCode && (
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Share List
                  </button>
                )}
                <Link
                  href="/my-lists"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Lists
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-8 lg:ml-8">
          {list.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No items in this list yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {list.items.map((item: SavedListItem) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        {item.brand && (
                          <span className="text-sm text-gray-600">by {item.brand}</span>
                        )}
                        {item.eco_friendly && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Eco-Friendly
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">{item.why}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        {item.est_price_usd && (
                          <span className="font-medium text-gray-900">
                            Estimated Cost: ${item.est_price_usd.toFixed(2)}
                          </span>
                        )}
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 underline hover:text-blue-800">
                            Buy Now
                          </a>
                        )}
                      </div>

                      {/* Voting */}
                      <div className="flex items-center gap-4 mb-4">
                        <button
                          onClick={() => handleVote(item.id, 'up')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            item.votes.userVote === 'up'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                          }`}
                        >
                          👍 {item.votes.thumbsUp}
                        </button>
                        
                        <button
                          onClick={() => handleVote(item.id, 'down')}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                            item.votes.userVote === 'down'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-red-50'
                          }`}
                        >
                          👎 {item.votes.thumbsDown}
                        </button>
                      </div>

                      {/* Comments */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Comments ({item.comments.length})</h4>
                        
                        {/* Add Comment */}
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={commentTexts[item.id] || ''}
                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(item.id)}
                          />
                          <button
                            onClick={() => handleAddComment(item.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Post
                          </button>
                        </div>
                        
                        {/* Comments List */}
                        <div className="space-y-3">
                          {item.comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
