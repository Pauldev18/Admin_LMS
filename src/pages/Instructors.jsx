// src/pages/Instructors.jsx
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import DataTable from "../components/UI/DataTable";
import Modal from "../components/UI/Modal";
import {
  createInstructor,
  deleteInstructor,
  fetchEligibleUsers,
  fetchInstructors,
  updateInstructor,
} from "../API/instructorApi";
import { toast } from "react-toastify";

function TagsInput({ value = [], onChange, placeholder = "Thêm kỹ năng..." }) {
  const [input, setInput] = useState("");

  const addTag = (raw) => {
    const tag = raw.trim();
    if (!tag) return;
    const exists = value.some((t) => t.toLowerCase() === tag.toLowerCase());
    if (!exists) onChange([...value, tag]);
  };

  const removeTag = (idx) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const handleKeyDown = (e) => {
    if (["Enter", "Tab", ","].includes(e.key)) {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
        setInput("");
      }
    } else if (e.key === "Backspace" && !input) {
      if (value.length) removeTag(value.length - 1);
    }
  };

  const handleBlur = () => {
    if (input.trim()) {
      addTag(input);
      setInput("");
    }
  };

  return (
    <div className="w-full min-h-10 flex items-center flex-wrap gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
      {value.map((tag, idx) => (
        <span
          key={`${tag}-${idx}`}
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(idx)}
            className="hover:text-blue-900"
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}

      <input
        className="flex-1 min-w-[120px] outline-none text-sm py-1"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
    </div>
  );
}

// ================= Instructors Page =================
const Instructors = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // create | edit | view
  const [instructors, setInstructors] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);

  const loadEligibleUsers = async () => {
    try {
      const res = await fetchEligibleUsers();
      setEligibleUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách user đủ điều kiện:", err);
    }
  };

  const loadData = async () => {
    try {
      const res = await fetchInstructors();
      setInstructors(res.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách instructors:", err);
    }
  };

  useEffect(() => {
    loadEligibleUsers();
    loadData();
  }, []);

  const columns = [
    {
      header: "Instructor",
      accessor: "name",
      render: (instructor) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
            {instructor.profilePicture ? (
              <img
                src={instructor.profilePicture}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-medium">
                {String(instructor.name || "")
                  .trim()
                  .split(/\s+/)
                  .map((n) => n[0])
                  .join("")}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{instructor.name}</p>
            <p className="text-sm text-gray-500">{instructor.title}</p>
          </div>
        </div>
      ),
    },
    { header: "Courses", accessor: "totalCourses" },
    {
      header: "Students",
      accessor: "numStudents",
      render: (i) => (i.numStudents ?? 0).toLocaleString(),
    },
    {
      header: "Rating",
      accessor: "rating",
      render: (i) => (
        <span className="text-yellow-500">★ {i.rating ?? 0}</span>
      ),
    },
    { header: "Reviews", accessor: "numReviews" },
    {
      header: "Status",
      accessor: "isActive",
      render: (i) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            i.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {i.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const handleCreate = () => {
    setModalMode("create");
    setSelectedInstructor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (instructor) => {
    setModalMode("edit");
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  const handleView = (instructor) => {
    setModalMode("view");
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  const handleDelete = async (instructor) => {
    if (confirm(`Bạn có chắc chắn muốn xoá instructor "${instructor.name}"?`)) {
      try {
        await deleteInstructor(instructor.id);
        alert("Đã xoá thành công!");
        loadData();
      } catch (error) {
        console.error("Lỗi xoá:", error);
        alert("Xoá thất bại!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Instructors</h1>
        <button onClick={handleCreate} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Instructor
        </button>
      </div>

      <DataTable
        data={instructors}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "create"
            ? "Create New Instructor"
            : modalMode === "edit"
            ? "Edit Instructor"
            : "Instructor Details"
        }
        size="lg"
      >
        <InstructorForm
          instructor={selectedInstructor}
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
          reload={loadData}
          eligibleUsers={eligibleUsers}
        />
      </Modal>
    </div>
  );
};

// ================= InstructorForm =================
const InstructorForm = ({ instructor, mode, onClose, reload, eligibleUsers }) => {
  const parseExpertises = (s) =>
    (s || "")
      .split("|")
      .map((x) => x.trim())
      .filter(Boolean);

  const [formData, setFormData] = useState({
    name: instructor?.name || "",
    title: instructor?.title || "",
    bio: instructor?.bio || "",
    profilePicture: instructor?.profilePicture || "",
    website: instructor?.website || "",
    twitter: instructor?.twitter || "",
    linkedin: instructor?.linkedin || "",
    youtube: instructor?.youtube || "",
    expertises: instructor?.expertises || "",
    isActive: instructor?.isActive ?? true,
    id: "", // userId khi create
  });

  const [expertisesArr, setExpertisesArr] = useState(
    parseExpertises(formData.expertises)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        website: formData.website,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        youtube: formData.youtube,
        isActive: formData.isActive,
        profilePicture: formData.profilePicture || "",
        expertises: expertisesArr.join("|"),
      };

      if (mode === "create") {
        const newInstructor = { ...payload, userId: formData.id };
        const res = await createInstructor(newInstructor);
        if (res.data === true) {
          onClose();
          reload();
          toast.success("Thêm instructor thành công");
        } else {
          toast.error("Tạo instructor thất bại.");
        }
      } else {
        await updateInstructor(instructor.id, payload);
        onClose();
        reload();
        toast.success("Cập nhật thành công");
      }
    } catch (err) {
      console.error("Lỗi submit instructor:", err);
      alert("Gửi thất bại!");
    }
  };

  // ===== VIEW =====
  if (mode === "view") {
    const viewExpertises = expertisesArr;
    return (
      <div className="space-y-6">
        <div className="bg-white shadow rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            👨‍🏫 Thông tin giảng viên
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Name</span>
              <span className="text-lg font-semibold text-gray-800">
                {instructor.name}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Title</span>
              <span className="text-lg text-gray-800">{instructor.title}</span>
            </div>

            <div className="flex flex-col md:col-span-2">
              <span className="text-sm font-medium text-gray-500">Bio</span>
              <p className="text-gray-700 leading-relaxed">
                {instructor.bio || "—"}
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${
                  instructor.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {instructor.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Courses</span>
              <span className="text-gray-800 font-semibold">
                {instructor.totalCourses ?? 0}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">
                Students
              </span>
              <span className="text-gray-800 font-semibold">
                {(instructor.numStudents ?? 0).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Rating</span>
              <span className="text-yellow-500 font-semibold">
                ⭐ {instructor.rating ?? 0}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500">Reviews</span>
              <span className="text-gray-800 font-semibold">
                {instructor.numReviews ?? 0}
              </span>
            </div>

            <div className="flex flex-col md:col-span-2">
              <span className="text-sm font-medium text-gray-500">
                Expertises
              </span>
              {viewExpertises.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {viewExpertises.map((t, i) => (
                    <span
                      key={`${t}-${i}`}
                      className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 mt-2 text-sm">—</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== CREATE / EDIT =====
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {mode === "create" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            User
          </label>
          <select
            className="input w-full"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            required
          >
            <option value="">-- Chọn user --</option>
            {eligibleUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            className="input w-full"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            className="input w-full"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="text"
            className="input w-full"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Twitter
          </label>
          <input
            type="text"
            className="input w-full"
            value={formData.twitter}
            onChange={(e) =>
              setFormData({ ...formData, twitter: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn
          </label>
          <input
            type="text"
            className="input w-full"
            value={formData.linkedin}
            onChange={(e) =>
              setFormData({ ...formData, linkedin: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            YouTube
          </label>
          <input
            type="text"
            className="input w-full"
            value={formData.youtube}
            onChange={(e) =>
              setFormData({ ...formData, youtube: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          className="input w-full"
          rows="3"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expertises
        </label>
        <TagsInput value={expertisesArr} onChange={setExpertisesArr} />
        <p className="mt-1 text-xs text-gray-400">
          Gõ kỹ năng và nhấn <kbd className="px-1 border rounded">Enter</kbd> hoặc{" "}
          <kbd className="px-1 border rounded">,</kbd> để thêm.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
        />
        <span className="text-sm">Active</span>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {mode === "create" ? "Create Instructor" : "Update Instructor"}
        </button>
      </div>
    </form>
  );
};

export default Instructors;
