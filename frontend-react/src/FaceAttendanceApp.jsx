import React, { useRef, useState, useEffect } from "react";
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Calendar,
  Clock,
  Play,
  StopCircle,
} from "lucide-react";

const API_URL = "http://localhost:3000/api/face-training";

export default function FaceAttendanceApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [recognizedFaces, setRecognizedFaces] = useState([]);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [tolerance, setTolerance] = useState(0.6);
  const [autoRecognize, setAutoRecognize] = useState(false);
  const [recognitionInterval, setRecognitionInterval] = useState(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (recognitionInterval) {
        clearInterval(recognitionInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (autoRecognize && isCameraOn) {
      const interval = setInterval(() => {
        handleRecognize();
      }, 3000);
      setRecognitionInterval(interval);

      return () => clearInterval(interval);
    } else if (recognitionInterval) {
      clearInterval(recognitionInterval);
      setRecognitionInterval(null);
    }
  }, [autoRecognize, isCameraOn]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsCameraOn(true);
      showMessage("📹 Camera đã bật", "success");
    } catch (error) {
      showMessage("❌ Không thể truy cập camera: " + error.message, "error");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraOn(false);
      setAutoRecognize(false);
      showMessage("Camera đã tắt", "info");
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.95);
  };

  const showMessage = (msg, type = "info") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleRecognize = async () => {
    if (!isCameraOn) {
      showMessage("⚠️ Vui lòng bật camera trước", "error");
      return;
    }

    setIsRecognizing(true);
    const imageData = captureFrame();

    try {
      const response = await fetch(`${API_URL}/recognize-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData,
          tolerance: tolerance,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const faces = result.data.recognized_faces || [];

        if (faces.length > 0) {
          setRecognizedFaces(faces);

          const recognizedPeople = faces.filter((f) => f.name !== "Unknown");

          if (recognizedPeople.length > 0) {
            const names = recognizedPeople
              .map((f) => `${f.name} (${f.confidence}%)`)
              .join(", ");
            showMessage(`✅ Nhận diện: ${names}`, "success");

            recognizedPeople.forEach((person) => {
              addAttendance(person);
            });
          } else {
            showMessage(
              `⚠️ Phát hiện ${faces.length} khuôn mặt nhưng không nhận diện được`,
              "error"
            );
          }
        } else {
          showMessage("⚠️ Không phát hiện khuôn mặt", "error");
          setRecognizedFaces([]);
        }
      } else {
        showMessage("❌ " + (result.message || result.error), "error");
      }
    } catch (error) {
      showMessage("❌ Lỗi nhận diện: " + error.message, "error");
    } finally {
      setIsRecognizing(false);
    }
  };

  const addAttendance = (person) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN");
    const dateStr = now.toLocaleDateString("vi-VN");

    const existing = todayAttendance.find((a) => a.name === person.name);

    if (!existing) {
      const newRecord = {
        id: Date.now(),
        name: person.name,
        confidence: person.confidence,
        time: timeStr,
        date: dateStr,
        timestamp: now.toISOString(),
        status: getAttendanceStatus(now),
      };

      setTodayAttendance((prev) => [newRecord, ...prev]);
      setAttendanceLog((prev) => [newRecord, ...prev]);

      showMessage(
        `✅ Điểm danh thành công: ${person.name} - ${newRecord.status}`,
        "success"
      );
    }
  };

  const getAttendanceStatus = (time) => {
    const hour = time.getHours();
    const minute = time.getMinutes();

    if (hour < 8) return "Đến sớm";
    if (hour === 8 && minute <= 30) return "Đúng giờ";
    if (hour === 8 && minute > 30) return "Đi trễ";
    if (hour > 8 && hour < 17) return "Đi trễ";
    if (hour >= 17 && hour < 18) return "Về đúng giờ";
    if (hour >= 18) return "Về muộn";
    return "Không xác định";
  };

  const MessageAlert = () => {
    if (!message) return null;

    const styles = {
      success: "bg-green-100 border-green-500 text-green-800",
      error: "bg-red-100 border-red-500 text-red-800",
      info: "bg-blue-100 border-blue-500 text-blue-800",
    };

    const Icon = { success: CheckCircle, error: XCircle, info: AlertCircle }[
      messageType
    ];

    return (
      <div
        className={`${styles[messageType]} border-l-4 p-4 mb-4 rounded flex items-center gap-2`}
      >
        <Icon size={20} />
        <span>{message}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Camera size={40} className="text-blue-600" />
          Hệ thống điểm danh khuôn mặt
        </h1>
        <p className="text-gray-600 mb-6">
          Nhận diện và ghi nhận thời gian điểm danh tự động
        </p>

        <MessageAlert />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Camera size={24} />
                  Camera nhận diện
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tolerance:</span>
                  <input
                    type="range"
                    min="0.3"
                    max="0.9"
                    step="0.1"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm font-mono">{tolerance}</span>
                </div>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <p className="text-white text-lg">Camera chưa bật</p>
                  </div>
                )}

                {recognizedFaces.map((face, idx) => (
                  <div
                    key={idx}
                    className="absolute border-2 border-green-400"
                    style={{
                      left: `${
                        (face.location.left / videoRef.current?.videoWidth) *
                          100 || 0
                      }%`,
                      top: `${
                        (face.location.top / videoRef.current?.videoHeight) *
                          100 || 0
                      }%`,
                      width: `${
                        ((face.location.right - face.location.left) /
                          videoRef.current?.videoWidth) *
                          100 || 0
                      }%`,
                      height: `${
                        ((face.location.bottom - face.location.top) /
                          videoRef.current?.videoHeight) *
                          100 || 0
                      }%`,
                    }}
                  >
                    <div className="absolute -top-8 left-0 bg-green-500 text-white px-2 py-1 rounded text-sm">
                      {face.name} ({face.confidence}%)
                    </div>
                  </div>
                ))}

                {isRecognizing && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg animate-pulse">
                    Đang nhận diện...
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {!isCameraOn ? (
                    <button
                      onClick={startCamera}
                      className="col-span-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Play size={20} />
                      Bật Camera
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleRecognize}
                        disabled={isRecognizing}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
                      >
                        <Camera size={20} />
                        Nhận diện ngay
                      </button>
                      <button
                        onClick={stopCamera}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium flex items-center justify-center gap-2"
                      >
                        <StopCircle size={20} />
                        Tắt Camera
                      </button>
                    </>
                  )}
                </div>

                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-blue-500">
                  <input
                    type="checkbox"
                    checked={autoRecognize}
                    onChange={(e) => setAutoRecognize(e.target.checked)}
                    disabled={!isCameraOn}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">
                    Tự động nhận diện liên tục (mỗi 3 giây)
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar size={24} />
                Lịch sử điểm danh hôm nay ({todayAttendance.length})
              </h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Thời gian</th>
                      <th className="px-4 py-2 text-left">Tên</th>
                      <th className="px-4 py-2 text-left">Độ chính xác</th>
                      <th className="px-4 py-2 text-left">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance.map((record) => (
                      <tr key={record.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{record.time}</td>
                        <td className="px-4 py-3 font-medium">{record.name}</td>
                        <td className="px-4 py-3 text-sm">
                          {record.confidence}%
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              record.status === "Đúng giờ"
                                ? "bg-green-100 text-green-800"
                                : record.status === "Đi trễ"
                                ? "bg-red-100 text-red-800"
                                : record.status === "Đến sớm"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock size={24} />
                Thống kê hôm nay
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Tổng điểm danh</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {todayAttendance.length}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Đúng giờ</div>
                  <div className="text-3xl font-bold text-green-600">
                    {
                      todayAttendance.filter(
                        (a) => a.status === "Đúng giờ" || a.status === "Đến sớm"
                      ).length
                    }
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600">Đi trễ</div>
                  <div className="text-3xl font-bold text-red-600">
                    {
                      todayAttendance.filter((a) => a.status === "Đi trễ")
                        .length
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4">
                Khuôn mặt vừa nhận diện
              </h3>
              {recognizedFaces.length > 0 ? (
                <div className="space-y-3">
                  {recognizedFaces.map((face, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        face.name === "Unknown"
                          ? "border-red-300 bg-red-50"
                          : "border-green-300 bg-green-50"
                      }`}
                    >
                      <div className="font-bold">{face.name}</div>
                      <div className="text-sm text-gray-600">
                        Độ chính xác: {face.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa nhận diện</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
