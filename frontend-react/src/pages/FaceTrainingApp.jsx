import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Users,
  Trash2,
  Play,
  X,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Zap,
  Filter,
} from "lucide-react";

const API_URL = "http://localhost:3000/api/face-training";

export default function FaceTrainingApp() {
  const [activeTab, setActiveTab] = useState("upload");
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Upload state
  const [uploadName, setUploadName] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [autoTrainUpload, setAutoTrainUpload] = useState(true);
  const fileInputRef = useRef(null);

  // Webcam state
  const [webcamName, setWebcamName] = useState("");
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [autoTrainWebcam, setAutoTrainWebcam] = useState(true);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Recognition state
  const [recognitionImage, setRecognitionImage] = useState(null);
  const [recognitionResults, setRecognitionResults] = useState([]);
  const [recognitionCanvas, setRecognitionCanvas] = useState(null);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (searchName.trim() === "") {
      setFilteredPeople(people);
    } else {
      const filtered = people.filter((person) =>
        person.name.toLowerCase().includes(searchName.toLowerCase())
      );
      setFilteredPeople(filtered);
    }
  }, [searchName, people]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const fetchPeople = async () => {
    try {
      const response = await fetch(`${API_URL}/list-trained-people`);
      const data = await response.json();

      console.log("API Response:", data);

      if (data.success) {
        const peopleData = data.data?.people || [];
        setPeople(peopleData);
        setFilteredPeople(peopleData);
      }
    } catch (error) {
      console.error("Error fetching people:", error);
      showMessage("error", "Không thể tải danh sách người");
    }
  };

  // ==================== UPLOAD FUNCTIONS ====================

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
  };

  const handleUpload = async () => {
    if (!uploadName.trim()) {
      showMessage("error", "Vui lòng nhập tên người");
      return;
    }

    if (uploadFiles.length === 0) {
      showMessage("error", "Vui lòng chọn ít nhất 1 ảnh");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", uploadName);

      if (uploadFiles.length === 1) {
        // Single file upload - field name MUST be "image"
        formData.append("image", uploadFiles[0]);

        const response = await fetch(`${API_URL}/upload-face`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          showMessage("error", data.message || "Upload thất bại");
          setLoading(false);
          return;
        }

        showMessage("success", "Upload ảnh thành công!");
      } else {
        // Multiple files upload - field name MUST be "images"
        uploadFiles.forEach((file) => {
          formData.append("images", file);
        });

        const response = await fetch(`${API_URL}/upload-multiple-faces`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!data.success) {
          showMessage("error", data.message || "Upload thất bại");
          setLoading(false);
          return;
        }

        showMessage("success", `Upload ${uploadFiles.length} ảnh thành công!`);
      }

      // Auto training
      if (autoTrainUpload) {
        await handleTraining(uploadName);
      }

      // Reset form
      setUploadName("");
      setUploadFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchPeople();
    } catch (error) {
      console.error("Upload error:", error);
      showMessage("error", "Lỗi khi upload: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== WEBCAM FUNCTIONS ====================

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsWebcamActive(true);
        showMessage("success", "Webcam đã bật");
      }
    } catch (error) {
      console.error("Webcam error:", error);
      showMessage(
        "error",
        "Không thể truy cập webcam. Vui lòng cho phép quyền truy cập camera."
      );
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    showMessage("success", "Webcam đã tắt");
  };

  const capturePhoto = () => {
    if (!webcamName.trim()) {
      showMessage("error", "Vui lòng nhập tên người trước khi chụp");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImages((prev) => [...prev, imageData]);
      showMessage("success", `Đã chụp ảnh #${capturedImages.length + 1}`);
    } else {
      showMessage("error", "Webcam chưa sẵn sàng. Vui lòng thử lại.");
    }
  };

  const uploadCapturedImages = async () => {
    if (capturedImages.length === 0) {
      showMessage("error", "Chưa có ảnh nào được chụp");
      return;
    }

    if (!webcamName.trim()) {
      showMessage("error", "Vui lòng nhập tên người");
      return;
    }

    setLoading(true);

    try {
      let successCount = 0;

      for (const image of capturedImages) {
        const response = await fetch(`${API_URL}/capture-webcam`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: webcamName,
            image: image,
          }),
        });

        const data = await response.json();

        if (data.success) {
          successCount++;
        } else {
          console.error("Upload failed:", data);
        }
      }

      if (successCount === capturedImages.length) {
        showMessage("success", `Đã upload ${successCount} ảnh thành công!`);

        // Auto training
        if (autoTrainWebcam) {
          await handleTraining(webcamName);
        }

        // Reset
        setCapturedImages([]);
        setWebcamName("");
        stopWebcam();
        await fetchPeople();
      } else {
        showMessage(
          "error",
          `Chỉ upload được ${successCount}/${capturedImages.length} ảnh`
        );
      }
    } catch (error) {
      console.error("Upload captured images error:", error);
      showMessage("error", "Lỗi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== TRAINING FUNCTIONS ====================

  const handleTraining = async (personName) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/train-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: personName }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", data.data?.message || "Training thành công!");
        await fetchPeople();
      } else {
        showMessage("error", data.message || "Training thất bại");
      }
    } catch (error) {
      console.error("Training error:", error);
      showMessage("error", "Lỗi training: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerson = async (personName) => {
    if (
      !window.confirm(
        `Xác nhận xóa "${personName}" và tất cả dữ liệu liên quan?`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/delete-person`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: personName }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("success", `Đã xóa ${personName} thành công!`);
        await fetchPeople();
      } else {
        showMessage("error", data.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showMessage("error", "Lỗi khi xóa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==================== RECOGNITION FUNCTIONS ====================

  const handleRecognitionFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecognitionImage(reader.result);
        setRecognitionResults([]);
        setRecognitionCanvas(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecognize = async () => {
    if (!recognitionImage) {
      showMessage("error", "Vui lòng chọn ảnh");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/recognize-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: recognitionImage }),
      });

      const data = await response.json();

      if (data.success) {
        const faces = data.data?.recognized_faces || [];
        setRecognitionResults(faces);

        if (faces.length > 0) {
          showMessage("success", `Phát hiện ${faces.length} khuôn mặt`);
          drawRecognitionBoxes(faces);
        } else {
          showMessage("error", "Không phát hiện khuôn mặt nào");
        }
      } else {
        showMessage("error", data.message || "Nhận diện thất bại");
      }
    } catch (error) {
      console.error("Recognition error:", error);
      showMessage("error", "Lỗi nhận diện: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const drawRecognitionBoxes = (faces) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);

      faces.forEach((face) => {
        const { top, right, bottom, left } = face.location;

        ctx.strokeStyle = face.name === "Unknown" ? "#ef4444" : "#22c55e";
        ctx.lineWidth = 3;
        ctx.strokeRect(left, top, right - left, bottom - top);

        ctx.fillStyle = face.name === "Unknown" ? "#ef4444" : "#22c55e";
        const text =
          face.name === "Unknown"
            ? "Unknown"
            : `${face.name} (${face.confidence}%)`;

        ctx.font = "bold 16px Arial";
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(left, top - 30, textWidth + 20, 30);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, left + 10, top - 10);
      });

      setRecognitionCanvas(canvas.toDataURL());
    };
    img.src = recognitionImage;
  };

  const filterRecognitionResults = () => {
    if (!searchName.trim()) {
      return recognitionResults;
    }
    return recognitionResults.filter((result) =>
      result.name.toLowerCase().includes(searchName.toLowerCase())
    );
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Face Training & Recognition System
          </h1>
          <p className="text-gray-600">Quản lý và nhận diện khuôn mặt</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center justify-between shadow-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="hover:opacity-70"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "upload", icon: Upload, label: "Upload Ảnh" },
            { id: "webcam", icon: Camera, label: "Chụp Webcam" },
            { id: "manage", icon: Users, label: "Quản Lý" },
            { id: "recognize", icon: Search, label: "Nhận Diện" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow"
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          {/* UPLOAD TAB */}
          {activeTab === "upload" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Upload /> Upload Ảnh Chân Dung
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên người *
                </label>
                <input
                  type="text"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  placeholder="Nhập tên người (VD: Nguyen Van A)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ảnh (1 hoặc nhiều ảnh) *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {uploadFiles.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <p className="text-sm text-gray-600">
                      Đã chọn {uploadFiles.length} ảnh
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <input
                  type="checkbox"
                  id="autoTrainUpload"
                  checked={autoTrainUpload}
                  onChange={(e) => setAutoTrainUpload(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <label
                  htmlFor="autoTrainUpload"
                  className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
                >
                  <Zap size={16} className="text-indigo-600" />
                  Tự động training sau khi upload
                </label>
              </div>

              <button
                onClick={handleUpload}
                disabled={
                  loading || !uploadName.trim() || uploadFiles.length === 0
                }
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "Đang xử lý..."
                  : autoTrainUpload
                  ? "Upload và Training"
                  : "Upload"}
              </button>
            </div>
          )}

          {/* WEBCAM TAB */}
          {activeTab === "webcam" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Camera /> Chụp Ảnh Từ Webcam
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên người *
                </label>
                <input
                  type="text"
                  value={webcamName}
                  onChange={(e) => setWebcamName(e.target.value)}
                  placeholder="Nhập tên người..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isWebcamActive}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={startWebcam}
                  disabled={isWebcamActive || loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Bắt đầu Webcam
                </button>
                <button
                  onClick={stopWebcam}
                  disabled={!isWebcamActive || loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Dừng Webcam
                </button>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                {!isWebcamActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <p className="text-white text-lg">Webcam chưa bật</p>
                  </div>
                )}
              </div>

              <button
                onClick={capturePhoto}
                disabled={!isWebcamActive || loading || !webcamName.trim()}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Chụp Ảnh
              </button>

              {capturedImages.length > 0 && (
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-indigo-900">
                      Đã chụp {capturedImages.length} ảnh
                    </h3>
                    <button
                      onClick={() => setCapturedImages([])}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <X size={16} />
                      Xóa tất cả
                    </button>
                  </div>

                  {capturedImages.length < 3 && (
                    <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-3">
                      <p className="text-sm text-yellow-800">
                        <strong>💡 Lưu ý:</strong> Nên chụp ít nhất 3-5 ảnh từ
                        các góc độ khác nhau để có kết quả nhận diện tốt hơn.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {capturedImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Captured ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-indigo-200"
                        />
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold">
                          #{idx + 1}
                        </div>
                        <button
                          onClick={() =>
                            setCapturedImages((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-indigo-200 mb-4">
                    <input
                      type="checkbox"
                      id="autoTrainWebcam"
                      checked={autoTrainWebcam}
                      onChange={(e) => setAutoTrainWebcam(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor="autoTrainWebcam"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Zap size={16} className="text-indigo-600" />
                      Tự động training sau khi upload
                    </label>
                  </div>

                  <button
                    onClick={uploadCapturedImages}
                    disabled={loading || capturedImages.length === 0}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading
                      ? "Đang xử lý..."
                      : autoTrainWebcam
                      ? `Upload và Training ${capturedImages.length} ảnh`
                      : `Upload ${capturedImages.length} ảnh`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MANAGE TAB */}
          {activeTab === "manage" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Users /> Quản Lý Người Đã Training
                </h2>
                <button
                  onClick={fetchPeople}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Làm mới
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {filteredPeople.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {searchName
                      ? "Không tìm thấy kết quả"
                      : "Chưa có người nào được training"}
                  </p>
                  <p className="text-sm mt-2">
                    {searchName
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Hãy upload ảnh để bắt đầu"}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Hiển thị {filteredPeople.length} / {people.length} người
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPeople.map((person) => (
                      <div
                        key={person.name}
                        className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                              {person.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">
                                {person.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {person.face_count} khuôn mặt
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTraining(person.name)}
                            disabled={loading}
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                          >
                            <Play size={16} /> Training
                          </button>
                          <button
                            onClick={() => handleDeletePerson(person.name)}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                          >
                            <Trash2 size={16} /> Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECOGNITION TAB */}
          {activeTab === "recognize" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Search /> Nhận Diện Khuôn Mặt
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn ảnh cần nhận diện *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleRecognitionFileSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {(recognitionCanvas || recognitionImage) && (
                <div className="relative bg-gray-100 rounded-lg p-4">
                  <img
                    src={recognitionCanvas || recognitionImage}
                    alt="Recognition"
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              )}

              <button
                onClick={handleRecognize}
                disabled={loading || !recognitionImage}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Search size={20} />
                {loading ? "Đang nhận diện..." : "Nhận Diện"}
              </button>

              {recognitionResults.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-800">
                      Kết quả nhận diện ({recognitionResults.length} khuôn mặt):
                    </h3>
                  </div>

                  {/* Search filter for results */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm kết quả theo tên..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {filterRecognitionResults().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle
                        size={48}
                        className="mx-auto mb-4 opacity-50"
                      />
                      <p>Không tìm thấy kết quả phù hợp</p>
                    </div>
                  ) : (
                    filterRecognitionResults().map((result) => (
                      <div
                        key={result.id}
                        className={`p-4 rounded-lg border-2 ${
                          result.name === "Unknown"
                            ? "bg-gray-50 border-gray-300"
                            : "bg-green-50 border-green-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                result.name === "Unknown"
                                  ? "bg-gray-400"
                                  : "bg-green-600"
                              } text-white`}
                            >
                              {result.name === "Unknown"
                                ? "?"
                                : result.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-lg">
                                {result.name === "Unknown"
                                  ? "Không xác định"
                                  : result.name}
                              </p>
                              {result.name !== "Unknown" && (
                                <p className="text-sm text-gray-600">
                                  Độ tin cậy: {result.confidence}%
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Vị trí</p>
                            <p className="text-xs text-gray-600">
                              ({result.location.left}, {result.location.top})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
