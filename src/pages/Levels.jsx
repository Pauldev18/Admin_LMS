// src/pages/Levels.jsx
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil } from "lucide-react";
import {
  getLevels,
  createLevel,
  updateLevel,
  toggleLevelStatus,
} from "../API/levelApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

// Simple Modal inline
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function Levels() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getLevels();
      setLevels(res.data || []);
    } catch (e) {
      console.error("Load levels fail:", e);
      toast.warning("Không tải được danh sách level.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (!debouncedQ) return levels;
    const kw = debouncedQ.toLowerCase();
    return levels.filter(
      (lv) =>
        String(lv.id).toLowerCase().includes(kw) ||
        String(lv.name || "").toLowerCase().includes(kw)
    );
  }, [levels, debouncedQ]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (lv) => {
    setEditing(lv);
    setModalOpen(true);
  };

  const handleToggleStatus = async (lv) => {
    const action = lv.isActive ? "xoá" : "khôi phục";
    const confirm = await Swal.fire({
      title: `Xác nhận ${action}?`,
      text: `Bạn có chắc chắn muốn ${action} level "${lv.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: lv.isActive ? "#d33" : "#28a745",
      cancelButtonColor: "#3085d6",
      confirmButtonText: lv.isActive ? "Xoá" : "Khôi phục",
      cancelButtonText: "Huỷ",
    });

    if (!confirm.isConfirmed) return;

    try {
      await toggleLevelStatus(lv.id, !lv.isActive);
      await loadData();
      Swal.fire(
        "Thành công!",
        `Level đã được ${lv.isActive ? "xoá" : "khôi phục"} thành công.`,
        "success"
      );
    } catch (e) {
      console.error("Toggle status fail:", e);
      Swal.fire("Lỗi", "Thao tác thất bại!", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trình độ</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm loại trình độ
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Tìm kiếm theo tên hoặc ID…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-left text-sm font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 w-40">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Đang tải…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              filtered.map((lv) => (
                <tr key={lv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{lv.id}</td>
                  <td className="px-4 py-3">{lv.name}</td>
                  <td className="px-4 py-3">
                    {lv.isActive ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded bg-red-100 px-2 py-1 text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(lv)}
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:bg-gray-100"
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleStatus(lv)}
                        className={`inline-flex items-center rounded-md border px-2 py-1 leading-none whitespace-nowrap ${
                          lv.isActive
                            ? "border-red-600 text-red-600 hover:bg-red-50"
                            : "border-green-600 text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {lv.isActive ? "Xoá" : "Khôi phục"}
                      </button>


                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Create/Edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Sửa loại trình độ" : "Thêm loại trình độ"}
      >
        <LevelForm
          editing={editing}
          onClose={() => setModalOpen(false)}
          afterSubmit={loadData}
        />
      </Modal>
    </div>
  );
}

function LevelForm({ editing, onClose, afterSubmit }) {
  const [form, setForm] = useState({
    name: editing?.name || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning("Name không được trống!");
      return;
    }
    try {
      setSubmitting(true);
      if (editing) {
        await updateLevel(editing.id, { name: form.name.trim() });
        toast.success("Cập nhật thành công");
      } else {
        await createLevel({ name: form.name.trim() });
        toast.success("Thêm thành công");
      }
      onClose();
      await afterSubmit();
    } catch (e) {
      console.error("Submit level fail:", e);
      toast.warning("Lưu thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Tên trình độ
        </label>
        <input
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          placeholder="Ví dụ: Beginner / Intermediate / Advanced"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
          disabled={submitting}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
        </button>
      </div>
    </form>
  );
}
