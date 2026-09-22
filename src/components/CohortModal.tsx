import React, { useEffect, useState } from 'react';
import { X, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CohortCustomer } from '../types';
import { fetchCohortCustomers } from '../api/client';
import { useFilters } from '../context/FilterContext';

interface CohortModalProps {
  stageName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CohortModal: React.FC<CohortModalProps> = ({ stageName, isOpen, onClose }) => {
  const { filters } = useFilters();
  const [customers, setCustomers] = useState<CohortCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 15;

  useEffect(() => {
    if (isOpen && stageName) {
      loadData(0);
    }
  }, [isOpen, stageName, filters]);

  const loadData = async (targetPage: number) => {
    setLoading(true);
    try {
      const data = await fetchCohortCustomers(stageName, filters, limit, targetPage * limit);
      setCustomers(data.customers || []);
      setTotal(data.total || 0);
      setPage(targetPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Cohort Drilldown: <span className="text-blue-600">{stageName}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing customers reaching lifecycle stage under current global filters ({total.toLocaleString()} total)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading customer cohort...</span>
            </div>
          ) : customers.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No customer records found matching this cohort filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Customer ID</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Customer Type</th>
                    <th className="px-4 py-3">Device</th>
                    <th className="px-4 py-3">Acquisition Channel</th>
                    <th className="px-4 py-3">Behavioral Segment</th>
                    <th className="px-4 py-3">Signup Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {customers.map((c) => (
                    <tr key={c.customer_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-blue-600 font-bold">{c.customer_id}</td>
                      <td className="px-4 py-2.5">{c.country}</td>
                      <td className="px-4 py-2.5">{c.customer_type}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px]">
                          {c.device}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{c.acquisition_channel}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px]">
                          {c.behavioral_segment}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{new Date(c.signup_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>Page {page + 1} of {Math.ceil(total / limit) || 1}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => loadData(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              disabled={(page + 1) * limit >= total}
              onClick={() => loadData(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-50 flex items-center gap-1 font-medium"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
