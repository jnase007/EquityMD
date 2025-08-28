import React, { useState, useEffect } from "react";
import { useAuthStore } from "../lib/store";
import { supabase } from "../lib/supabase";
import {
  Building2,
  Plus,
  Edit,
  Eye,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

interface Syndicator {
  id: string;
  company_name: string;
  company_description: string | null;
  company_logo_url: string | null;
  verification_status: "unverified" | "verified" | "premier";
  claimed_by: string | null;
  claimed_at: string | null;
  claimable: boolean;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

interface SyndicatorManagerProps {
  onCreateNew: () => void;
  onEditSyndicator: (syndicator: Syndicator) => void;
}

export function SyndicatorManager({
  onCreateNew,
  onEditSyndicator,
}: SyndicatorManagerProps) {
  const { user, profile } = useAuthStore();
  const [syndicators, setSyndicators] = useState<Syndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSyndicatorName, setNewSyndicatorName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSyndicators();
    }
  }, [user]);

  async function fetchUserSyndicators() {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("syndicators")
        .select("*")
        .eq("claimed_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSyndicators(data || []);
    } catch (error) {
      console.error("Error fetching syndicators:", error);
      toast.error("Failed to load your syndicators");
    } finally {
      setLoading(false);
    }
  }

  async function createNewSyndicator() {
    if (!user || !newSyndicatorName.trim()) return;

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from("syndicators")
        .insert([
          {
            company_name: newSyndicatorName.trim(),
            claimed_by: user.id,
            claimed_at: new Date().toISOString(),
            claimable: false, // User-created syndicators are not claimable by others
            verification_status: "unverified",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSyndicators([data, ...syndicators]);
      setNewSyndicatorName("");
      setShowCreateForm(false);
      toast.success("Syndicator created successfully!");

      // Auto-edit the new syndicator
      onEditSyndicator(data);
    } catch (error) {
      console.error("Error creating syndicator:", error);
      toast.error("Failed to create syndicator");
    } finally {
      setCreating(false);
    }
  }

  async function deleteSyndicator(syndicatorId: string, companyName: string) {
    if (
      !window.confirm(
        `Are you sure you want to delete "${companyName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("syndicators")
        .delete()
        .eq("id", syndicatorId)
        .eq("claimed_by", user?.id); // Extra safety check

      if (error) throw error;

      setSyndicators(syndicators.filter((s) => s.id !== syndicatorId));
      toast.success("Syndicator deleted successfully");
    } catch (error) {
      console.error("Error deleting syndicator:", error);
      toast.error("Failed to delete syndicator");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case "premier":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Premier
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Unverified
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Building2 className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-semibold text-gray-900">
            Your Syndicators
          </h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition hover:scale-105 transform"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Syndicator
        </button>
      </div>

      {/* Create New Syndicator Form */}
      {showCreateForm && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Create New Syndicator</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={newSyndicatorName}
                onChange={(e) => setNewSyndicatorName(e.target.value)}
                placeholder="Enter company name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                onKeyPress={(e) => e.key === "Enter" && createNewSyndicator()}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={createNewSyndicator}
                disabled={creating || !newSyndicatorName.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {creating ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewSyndicatorName("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            You can create multiple syndicators and manage them independently.
            Each syndicator will need to be verified separately.
          </p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Manage Multiple Syndicators</p>
            <p>
              You can create and manage multiple syndicator profiles for
              different companies or investment entities. Each syndicator can be
              verified independently and will have its own profile page.
            </p>
          </div>
        </div>
      </div>

      {/* Syndicators List */}
      {syndicators.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Syndicators Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first syndicator profile to start showcasing deals to
            investors.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Syndicator
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {syndicators.map((syndicator) => (
            <div
              key={syndicator.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                    {syndicator.company_logo_url ? (
                      <img
                        src={syndicator.company_logo_url}
                        alt={syndicator.company_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {syndicator.company_name}
                      </h3>
                      {getStatusBadge(syndicator.verification_status)}
                    </div>
                    {syndicator.company_description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {syndicator.company_description}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      Created{" "}
                      {new Date(syndicator.created_at).toLocaleDateString()}
                      {syndicator.claimed_at && (
                        <span>
                          {" "}
                          • Claimed{" "}
                          {new Date(syndicator.claimed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {syndicator.slug && (
                    <a
                      href={`/syndicator/${syndicator.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 transition"
                      title="View public profile"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  )}
                  <button
                    onClick={() => onEditSyndicator(syndicator)}
                    className="p-2 text-gray-600 hover:text-purple-600 transition"
                    title="Edit syndicator"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      deleteSyndicator(syndicator.id, syndicator.company_name)
                    }
                    className="p-2 text-gray-600 hover:text-red-600 transition"
                    title="Delete syndicator"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Note */}
      {syndicators.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Pro tip:</strong> Completing your syndicator profile
            increase your chances of verification
          </p>
        </div>
      )}
    </div>
  );
}
