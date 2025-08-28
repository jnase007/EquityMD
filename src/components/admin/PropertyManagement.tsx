import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Search,
  Filter,
  Building2,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  Edit,
  Archive,
  CheckCircle,
  XCircle,
  Eye,
  Save,
  X,
} from "lucide-react";

interface Deal {
  id: string;
  title: string;
  location: string;
  property_type: string;
  minimum_investment: number;
  target_irr: number;
  investment_term: number;
  status: string;
  cover_image_url: string;
  created_at: string;
  syndicator: {
    company_name: string;
  };
}

export function PropertyManagement() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "draft" | "archived">(
    "all"
  );
  const [editingDeal, setEditingDeal] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Deal>>({});

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    setLoading(true);
    const { data, error } = await supabase.from("deals").select(`
      *,
      syndicator:syndicator_id (
        company_name
      )
    `);

    if (error) throw error;

    setDeals(data);
    setLoading(false);
  }

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.syndicator?.company_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || deal.status === filter;

    return matchesSearch && matchesFilter;
  });

  const updateDealStatus = async (dealId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("deals")
        .update({ status })
        .eq("id", dealId);

      if (error) throw error;

      setDeals(
        deals.map((deal) => (deal.id === dealId ? { ...deal, status } : deal))
      );
    } catch (error) {
      console.error("Error updating deal:", error);
    }
  };

  const startEdit = (deal: Deal) => {
    setEditingDeal(deal.id);
    setEditForm({
      title: deal.title,
      location: deal.location,
      property_type: deal.property_type,
      minimum_investment: deal.minimum_investment,
      target_irr: deal.target_irr,
      investment_term: deal.investment_term,
      cover_image_url: deal.cover_image_url
    });
  };

  const cancelEdit = () => {
    setEditingDeal(null);
    setEditForm({});
  };

  const saveDeal = async (dealId: string) => {
    try {
      const { error } = await supabase
        .from("deals")
        .update(editForm)
        .eq("id", dealId);

      if (error) throw error;

      setDeals(
        deals.map((deal) => 
          deal.id === dealId ? { ...deal, ...editForm } : deal
        )
      );
      
      setEditingDeal(null);
      setEditForm({});
    } catch (error) {
      console.error("Error updating deal:", error);
    }
  };

  if (loading) {
    return <div>Loading properties...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Property Management</h2>
        <div className="flex gap-4">
          <Link
            to="/deals/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Property
          </Link>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Properties</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Syndicator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Investment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDeals.map((deal) => (
              <tr key={deal.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        src={
                          deal.cover_image_url ||
                          "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80"
                        }
                        alt={deal.title}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {editingDeal === deal.id ? (
                          <input
                            type="text"
                            value={editForm.title || ""}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          deal.title
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {editingDeal === deal.id ? (
                          <input
                            type="text"
                            value={editForm.location || ""}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          deal.location
                        )}
                      </div>
                      {editingDeal === deal.id && (
                        <div className="text-xs text-gray-400 mt-1">
                          <input
                            type="url"
                            placeholder="Cover image URL"
                            value={editForm.cover_image_url || ""}
                            onChange={(e) => setEditForm({ ...editForm, cover_image_url: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {deal.syndicator?.company_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {editingDeal === deal.id ? (
                      <select
                        value={editForm.property_type || ""}
                        onChange={(e) => setEditForm({ ...editForm, property_type: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="multifamily">Multifamily</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="retail">Retail</option>
                        <option value="office">Office</option>
                        <option value="mixed-use">Mixed Use</option>
                      </select>
                    ) : (
                      deal.property_type
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Min: {editingDeal === deal.id ? (
                        <input
                          type="number"
                          value={editForm.minimum_investment || ""}
                          onChange={(e) => setEditForm({ ...editForm, minimum_investment: Number(e.target.value) })}
                          className="w-20 px-1 py-1 border border-gray-300 rounded text-sm ml-1"
                        />
                      ) : (
                        `$${deal.minimum_investment.toLocaleString()}`
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Target: {editingDeal === deal.id ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editForm.target_irr || ""}
                          onChange={(e) => setEditForm({ ...editForm, target_irr: Number(e.target.value) })}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-sm ml-1"
                        />
                      ) : (
                        `${deal.target_irr}%`
                      )} IRR
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      Term: {editingDeal === deal.id ? (
                        <input
                          type="number"
                          value={editForm.investment_term || ""}
                          onChange={(e) => setEditForm({ ...editForm, investment_term: Number(e.target.value) })}
                          className="w-16 px-1 py-1 border border-gray-300 rounded text-sm ml-1"
                        />
                      ) : (
                        `${deal.investment_term}`
                      )} years
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={deal.status}
                    onChange={(e) => updateDealStatus(deal.id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      deal.status === "active"
                        ? "bg-green-100 text-green-800"
                        : deal.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3">
                    {editingDeal === deal.id ? (
                      <>
                        <button
                          onClick={() => saveDeal(deal.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Save changes"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-900"
                          title="Cancel edit"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/deals/${deal.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="View deal"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => startEdit(deal)}
                          className="text-gray-600 hover:text-blue-900"
                          title="Edit deal"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            updateDealStatus(
                              deal.id,
                              deal.status === "archived" ? "draft" : "archived"
                            )
                          }
                          className={`${
                            deal.status === "archived"
                              ? "text-green-600 hover:text-green-900"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                          title={
                            deal.status === "archived"
                              ? "Restore deal"
                              : "Archive deal"
                          }
                        >
                          <Archive className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
