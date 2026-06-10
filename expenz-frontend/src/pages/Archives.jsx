// src/pages/Archives.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import Loader from '../components/common/Loader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ArchiveList from '../components/archives/ArchiveList';
import Card from '../components/common/Card';
import ArchiveIcon from '../assets/svgs/ArchiveIcon';
import { formatCurrency } from '../utils/formatters';

const Archives = () => {
  const [archives, setArchives] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { request, loading } = useApi();

  const fetchArchives = useCallback(async () => {
    try {
      const res = await request('get', '/archives');
      setArchives(res.archives || res || []);
    } catch {} finally {
      setPageLoading(false);
    }
  }, [request]);

  useEffect(() => { fetchArchives(); }, [fetchArchives]);

  const handleRestore = async (item) => {
    try {
      await request('post', `/archives/${item._id}/restore`, null, 'Transaction restored');
      fetchArchives();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await request('delete', `/archives/${deleteTarget._id}`, null, 'Permanently deleted');
      setDeleteTarget(null);
      fetchArchives();
    } catch {}
  };

  if (pageLoading) return <Loader text="Loading archives..." />;

  return (
    <div className="space-y-6">
      {/* Info */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sage-100">
            <ArchiveIcon size={24} className="text-sage-600" />
          </div>
          <div>
            <h3 className="text-base font-roboto font-bold text-forest-800">Transaction Archives</h3>
            <p className="text-sm font-roboto text-sage-500">
              {archives.length} archived record{archives.length !== 1 ? 's' : ''}. Restore or permanently delete.
            </p>
          </div>
        </div>
      </Card>

      {/* Archive List */}
      <ArchiveList archives={archives} onRestore={handleRestore} onDelete={(item) => setDeleteTarget(item)} />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Permanent Delete"
        message="This action cannot be undone. This record will be permanently removed."
        loading={loading}
      />
    </div>
  );
};

export default Archives;