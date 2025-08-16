import { useEffect, useMemo, useState } from 'react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { fetchPayments } from '../API/paymentApi';
import { toast } from 'react-toastify';

// Utils
const formatMoney = (v) =>
  (v ?? 0) instanceof Number
    ? v.toLocaleString('vi-VN')
    : Number(v ?? 0).toLocaleString('vi-VN');

const formatDate = (d) => new Date(d).toLocaleString('vi-VN');

// Badge màu theo status
const statusClasses = {
  SUCCESS: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAIL: 'bg-red-100 text-red-800',
};

// Bộ lọc
const defaultFilters = {
  status: '',         
  method: '',        
  dateFrom: '',      
  dateTo: '',   
  keyword: '',       
  amountMin: '',      
  amountMax: '',       
};

const Payments = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchPayments();
        setPayments(res || []);
      } catch (e) {
        console.error('Lỗi khi tải payments:', e);
        toast.error('Lỗi khi tải danh sách thanh toán');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPayments = useMemo(() => {
    return (payments || []).filter((p) => {

      if (filters.status && p.status !== filters.status) return false;


      if (filters.method && (p.paymentMethod || '') !== filters.method) return false;

   
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (new Date(p.createdAt) < from) return false;
      }
      if (filters.dateTo) {
     
        const to = new Date(filters.dateTo);
        to.setDate(to.getDate() + 1);
        if (new Date(p.createdAt) >= to) return false;
      }

    
        if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const hit =
            (p.userName || '').toLowerCase().includes(kw) ||
            (p.courseName || '').toLowerCase().includes(kw) ||
            (p.txnRef || '').toLowerCase().includes(kw) ||
            (p.voucherCode || '').toLowerCase().includes(kw);
        if (!hit) return false;
        }


   
      const amount = Number(p.amount ?? 0);
      if (filters.amountMin !== '' && !Number.isNaN(Number(filters.amountMin))) {
        if (amount < Number(filters.amountMin)) return false;
      }
      if (filters.amountMax !== '' && !Number.isNaN(Number(filters.amountMax))) {
        if (amount > Number(filters.amountMax)) return false;
      }

      return true;
    });
  }, [payments, filters]);

const columns = [
  {
    header: 'Mã GD',
    accessor: 'txnRef',
    render: (row) => (
      <div className="max-w-[180px]">
        <p className="font-medium text-gray-900 truncate">{row.txnRef}</p>
        <p className="text-xs text-gray-500">{row.id}</p>
      </div>
    ),
  },
  {
    header: 'User',
    accessor: 'userName',
    render: (row) => (
      <div className="max-w-[180px]">
        <p className="font-medium text-gray-900 truncate">{row.userName || '-'}</p>
        <p className="text-xs text-gray-500">Course: {row.courseName || '-'}</p>
      </div>
    ),
  },
  {
    header: 'Số tiền',
    accessor: 'amount',
    render: (row) => (
      <div className="text-gray-900 font-semibold">{formatMoney(row.amount)} đ</div>
    ),
  },
  {
    header: 'Phương thức',
    accessor: 'paymentMethod',
    render: (row) => <span className="text-gray-800">{row.paymentMethod || '-'}</span>,
  },
  {
    header: 'Trạng thái',
    accessor: 'status',
    render: (row) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusClasses[row.status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    header: 'Thời gian',
    accessor: 'createdAt',
    render: (row) => (
      <div className="text-gray-700">
        <div>{formatDate(row.createdAt)}</div>
      </div>
    ),
  },
];


  const handleView = (payment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
      </div>

      <PaymentFilters filters={filters} setFilters={setFilters} />

      <DataTable
        data={filteredPayments}
        columns={columns}
        onView={handleView}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Chi tiết thanh toán"
        size="lg"
      >
        {selectedPayment && (
          <PaymentDetails payment={selectedPayment} onClose={() => setIsModalOpen(false)} />
        )}
      </Modal>
    </div>
  );
};

const PaymentDetails = ({ payment, onClose }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mã giao dịch</label>
          <p className="text-gray-900">{payment.txnRef}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
          <p className="text-gray-900">{formatDate(payment.createdAt)}</p>
        </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <p className="text-gray-900">{payment.userName || '-'}</p>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <p className="text-gray-900">{payment.courseName || '-'}</p>
            </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
          <p className="text-gray-900 font-semibold">{formatMoney(payment.amount)} đ</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
          <p className="text-gray-900">{payment.paymentMethod || '-'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Voucher</label>
          <p className="text-gray-900">{payment.voucherCode || '-'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              statusClasses[payment.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {payment.status}
          </span>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="btn-secondary">Đóng</button>
      </div>
    </div>
  );
};

const PaymentFilters = ({ filters, setFilters }) => {
  const [local, setLocal] = useState(filters);

  // debounce apply
  useEffect(() => {
    const t = setTimeout(() => setFilters((prev) => ({ ...prev, keyword: local.keyword })), 350);
    return () => clearTimeout(t);
  }, [local.keyword, setFilters]);

  const update = (patch) => setLocal((s) => ({ ...s, ...patch }));
  const applyRange = () => {
    setFilters((prev) => ({
      ...prev,
      status: local.status,
      method: local.method,
      dateFrom: local.dateFrom,
      dateTo: local.dateTo,
      amountMin: local.amountMin,
      amountMax: local.amountMax,
    }));
  };
  const reset = () => {
    setLocal(defaultFilters);
    setFilters(defaultFilters);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
          <input
            type="text"
            value={local.keyword}
            onChange={(e) => update({ keyword: e.target.value })}
            placeholder="userId, courseId, txnRef, voucherCode"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            value={local.status}
            onChange={(e) => update({ status: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          >
            <option value="">Tất cả</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAIL">FAIL</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
          <select
            value={local.method}
            onChange={(e) => update({ method: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          >
            <option value="">Tất cả</option>
            <option value="VNPay">VNPAY</option>
            <option value="credit_card">Credit-Card</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
          <input
            type="date"
            value={local.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
          <input
            type="date"
            value={local.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (từ)</label>
          <input
            type="number"
            value={local.amountMin}
            onChange={(e) => update({ amountMin: e.target.value })}
            placeholder="Min"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (đến)</label>
          <input
            type="number"
            value={local.amountMax}
            onChange={(e) => update({ amountMax: e.target.value })}
            placeholder="Max"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        <div className="md:col-span-2 flex items-end gap-2">
          <button onClick={applyRange} className="btn-primary">Áp dụng</button>
          <button onClick={reset} className="btn-secondary">Đặt lại</button>
        </div>
      </div>
    </div>
  );
};

export default Payments;
