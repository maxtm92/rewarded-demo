'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface EverflowOffer {
  network_offer_id: number;
  name: string;
  offer_status: string;
  payout: string;
  payout_type: string;
  destination_url: string;
  today_clicks: number;
  today_revenue: string;
  syncStatus: 'linked' | 'unlinked' | 'drifted';
  localWall: {
    id: string;
    slug: string;
    name: string;
    isActive: boolean;
    everflowLastSyncAt: string | null;
  } | null;
}

interface EverflowAffiliate {
  network_affiliate_id: number;
  name: string;
  account_status: string;
  today_revenue: string;
  network_country_code: string;
}

interface EverflowPixel {
  network_pixel_id: number;
  delivery_method: string;
  pixel_level: string;
  pixel_status: string;
  postback_url: string;
  network_affiliate_name: string;
  description: string;
}

interface LocalWall {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  everflowOfferId: string | null;
}

interface DashboardData {
  offers: EverflowOffer[];
  affiliates: EverflowAffiliate[];
  pixels: EverflowPixel[];
  localWalls: LocalWall[];
  apiConfigured: boolean;
}

type Tab = 'offers' | 'affiliates' | 'pixels';

export default function EverflowDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('offers');
  const [syncing, setSyncing] = useState(false);
  const [configuringPostback, setConfiguringPostback] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/everflow');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch');
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/everflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-offers' }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success(`Synced ${result.synced} offers. ${result.unmatched.length} unmatched.`);
      if (result.drifted.length > 0) {
        toast.warning(`${result.drifted.length} offer(s) have drifted status`);
      }
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  async function handleConfigurePostback() {
    setConfiguringPostback(true);
    try {
      const appUrl = window.location.origin;
      const res = await fetch('/api/admin/everflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'configure-postback', appUrl }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      if (result.alreadyExists) {
        toast.info('Postback pixel already exists');
      } else {
        toast.success('Postback pixel created in Everflow');
      }
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to configure postback');
    } finally {
      setConfiguringPostback(false);
    }
  }

  async function handleLinkOffer(everflowOfferId: number, offerWallId: string) {
    try {
      const res = await fetch('/api/admin/everflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'link-offer', everflowOfferId, offerWallId }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success('Offer linked successfully');
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to link offer');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium mb-2">Failed to connect to Everflow API</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const linkedCount = data.offers.filter((o) => o.syncStatus === 'linked').length;
  const driftedCount = data.offers.filter((o) => o.syncStatus === 'drifted').length;
  const activeAffiliates = data.affiliates.filter((a) => a.account_status === 'active').length;
  const activePixels = data.pixels.filter((p) => p.pixel_status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard label="API Status" value="Connected" color="green" />
        <StatusCard
          label="Offers"
          value={`${data.offers.length} total / ${linkedCount} linked`}
          color={driftedCount > 0 ? 'yellow' : 'green'}
        />
        <StatusCard label="Affiliates" value={`${activeAffiliates} active`} color="blue" />
        <StatusCard label="Postback Pixels" value={`${activePixels} active`} color="blue" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Offers from Everflow'}
        </button>
        <button
          onClick={handleConfigurePostback}
          disabled={configuringPostback}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {configuringPostback ? 'Configuring...' : 'Auto-Configure Postback'}
        </button>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
        >
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(['offers', 'affiliates', 'pixels'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium border-b-2 transition ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'offers' ? `Offers (${data.offers.length})` : null}
              {t === 'affiliates' ? `Affiliates (${data.affiliates.length})` : null}
              {t === 'pixels' ? `Pixels (${data.pixels.length})` : null}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === 'offers' && (
        <OffersTab offers={data.offers} localWalls={data.localWalls} onLink={handleLinkOffer} />
      )}
      {tab === 'affiliates' && <AffiliatesTab affiliates={data.affiliates} />}
      {tab === 'pixels' && <PixelsTab pixels={data.pixels} />}
    </div>
  );
}

/* ── Sub-Components ───────────────────────────────── */

function StatusCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'green' | 'yellow' | 'blue' | 'red';
}) {
  const colors = {
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-xs font-medium opacity-70">{label}</p>
      <p className="text-sm font-semibold mt-1">{value}</p>
    </div>
  );
}

function SyncBadge({ status }: { status: 'linked' | 'unlinked' | 'drifted' }) {
  const styles = {
    linked: 'bg-green-100 text-green-700',
    unlinked: 'bg-gray-100 text-gray-500',
    drifted: 'bg-yellow-100 text-yellow-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    deleted: 'bg-red-100 text-red-700',
    inactive: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

/* ── Offers Tab ───────────────────────────────────── */

function OffersTab({
  offers,
  localWalls,
  onLink,
}: {
  offers: EverflowOffer[];
  localWalls: LocalWall[];
  onLink: (everflowOfferId: number, offerWallId: string) => void;
}) {
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const unlinkedWalls = localWalls.filter((w) => !w.everflowOfferId);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Payout</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Today</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Sync</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Linked Wall</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {offers.map((offer) => (
            <tr key={offer.network_offer_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-mono">{offer.network_offer_id}</td>
              <td className="px-4 py-3 text-gray-900 max-w-xs truncate">{offer.name}</td>
              <td className="px-4 py-3">
                <StatusBadge status={offer.offer_status} />
              </td>
              <td className="px-4 py-3 text-gray-600">{offer.payout}</td>
              <td className="px-4 py-3 text-gray-600">
                {offer.today_clicks} clicks / {offer.today_revenue}
              </td>
              <td className="px-4 py-3">
                <SyncBadge status={offer.syncStatus} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {offer.localWall ? (
                  <span className="font-medium text-gray-900">{offer.localWall.name}</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {offer.syncStatus === 'unlinked' && unlinkedWalls.length > 0 && (
                  <>
                    {linkingId === offer.network_offer_id ? (
                      <select
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        onChange={(e) => {
                          if (e.target.value) {
                            onLink(offer.network_offer_id, e.target.value);
                            setLinkingId(null);
                          }
                        }}
                        defaultValue=""
                      >
                        <option value="">Select wall...</option>
                        {unlinkedWalls.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setLinkingId(offer.network_offer_id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Link
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Affiliates Tab ───────────────────────────────── */

function AffiliatesTab({ affiliates }: { affiliates: EverflowAffiliate[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Country</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Today Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {affiliates.map((aff) => (
            <tr key={aff.network_affiliate_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-mono">{aff.network_affiliate_id}</td>
              <td className="px-4 py-3 text-gray-900">{aff.name}</td>
              <td className="px-4 py-3">
                <StatusBadge status={aff.account_status} />
              </td>
              <td className="px-4 py-3 text-gray-600">{aff.network_country_code || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{aff.today_revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Pixels Tab ───────────────────────────────────── */

function PixelsTab({ pixels }: { pixels: EverflowPixel[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">ID</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Method</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Level</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Affiliate</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Postback URL</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pixels.map((px) => (
            <tr key={px.network_pixel_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-900 font-mono">{px.network_pixel_id}</td>
              <td className="px-4 py-3 text-gray-900">{px.description || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{px.delivery_method}</td>
              <td className="px-4 py-3 text-gray-600">{px.pixel_level}</td>
              <td className="px-4 py-3">
                <StatusBadge status={px.pixel_status} />
              </td>
              <td className="px-4 py-3 text-gray-600">{px.network_affiliate_name || 'Global'}</td>
              <td className="px-4 py-3 text-gray-500 max-w-xs truncate font-mono text-xs">
                {px.postback_url || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
