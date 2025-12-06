const axios = require("axios");
const fs = require("fs");
const path = require("path");

// URL của Python API
const PYTHON_API_URL = "http://localhost:5000/api";

// Tạo thư mục uploads nếu chưa có
const UPLOAD_DIR = path.join(__dirname, "../../uploads/face-training");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("✅ Created upload directory:", UPLOAD_DIR);
}

class FaceTrainingController {
  // 1. Upload ảnh chân dung
  async uploadFace(req, res) {
    try {
      const { name } = req.body;
      const file = req.file;

      if (!name || !file) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên hoặc file ảnh",
        });
      }

      // Kiểm tra file có tồn tại không
      if (!fs.existsSync(file.path)) {
        return res.status(500).json({
          success: false,
          message: "File không tồn tại sau khi upload",
        });
      }

      // Đọc file và chuyển sang base64
      const imageBuffer = fs.readFileSync(file.path);
      const base64Image = imageBuffer.toString("base64");

      // Gửi đến Python API
      const response = await axios.post(`${PYTHON_API_URL}/upload-face`, {
        name: name,
        image: `data:image/jpeg;base64,${base64Image}`,
      });

      // Xóa file tạm sau khi đã gửi
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      res.json({
        success: true,
        message: "Upload ảnh thành công",
        data: response.data,
      });
    } catch (error) {
      console.error("Error uploading face:", error.message);

      // Xóa file tạm nếu có lỗi
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Lỗi khi upload ảnh",
        error: error.response?.data || error.message,
      });
    }
  }

  // 2. Chụp ảnh webcam
  async captureWebcam(req, res) {
    try {
      const { name, image } = req.body;

      if (!name || !image) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên hoặc ảnh",
        });
      }

      // Gửi đến Python API
      const response = await axios.post(`${PYTHON_API_URL}/capture-webcam`, {
        name: name,
        image: image,
      });

      res.json({
        success: true,
        message: "Chụp ảnh thành công",
        data: response.data,
      });
    } catch (error) {
      console.error("Error capturing webcam:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi chụp ảnh",
        error: error.response?.data || error.message,
      });
    }
  }

  // 3. Training khuôn mặt
  async trainFace(req, res) {
    try {
      const { name, image_path } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên",
        });
      }

      // Gửi đến Python API
      const response = await axios.post(`${PYTHON_API_URL}/train-face`, {
        name: name,
        image_path: image_path,
      });

      res.json({
        success: true,
        message: "Training thành công",
        data: response.data,
      });
    } catch (error) {
      console.error("Error training face:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi training",
        error: error.response?.data || error.message,
      });
    }
  }

  // 4. Danh sách ảnh training
  async listTrainingImages(req, res) {
    try {
      const { name } = req.query;

      const response = await axios.get(
        `${PYTHON_API_URL}/list-training-images`,
        {
          params: { name },
        }
      );

      res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error("Error listing images:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách ảnh",
        error: error.response?.data || error.message,
      });
    }
  }

  // 5. Xóa ảnh
  async deleteImage(req, res) {
    try {
      const { filename } = req.body;

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên file",
        });
      }

      const response = await axios.delete(`${PYTHON_API_URL}/delete-image`, {
        data: { filename },
      });

      res.json({
        success: true,
        message: "Xóa ảnh thành công",
        data: response.data,
      });
    } catch (error) {
      console.error("Error deleting image:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa ảnh",
        error: error.response?.data || error.message,
      });
    }
  }

  // 6. Sinh embedding
  async generateEmbedding(req, res) {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({
          success: false,
          message: "Thiếu ảnh",
        });
      }

      const response = await axios.post(
        `${PYTHON_API_URL}/generate-embedding`,
        {
          image: image,
        }
      );

      res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error("Error generating embedding:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi sinh embedding",
        error: error.response?.data || error.message,
      });
    }
  }

  // 7. Kiểm tra chất lượng ảnh
  async checkImageQuality(req, res) {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({
          success: false,
          message: "Thiếu ảnh",
        });
      }

      const response = await axios.post(
        `${PYTHON_API_URL}/check-image-quality`,
        {
          image: image,
        }
      );

      res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error("Error checking quality:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi kiểm tra chất lượng",
        error: error.response?.data || error.message,
      });
    }
  }

  // 8. Danh sách người đã train
  async listTrainedPeople(req, res) {
    try {
      const response = await axios.get(`${PYTHON_API_URL}/list-trained-people`);

      res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error("Error listing people:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách người",
        error: error.response?.data || error.message,
      });
    }
  }

  // 9. Xóa người
  async deletePerson(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên",
        });
      }

      const response = await axios.delete(`${PYTHON_API_URL}/delete-person`, {
        data: { name },
      });

      res.json({
        success: true,
        message: "Xóa người thành công",
        data: response.data,
      });
    } catch (error) {
      console.error("Error deleting person:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa người",
        error: error.response?.data || error.message,
      });
    }
  }

  // 10. Upload nhiều ảnh cùng lúc
  async uploadMultipleFaces(req, res) {
    try {
      const { name } = req.body;
      const files = req.files;

      if (!name || !files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên hoặc file ảnh",
        });
      }

      const results = [];

      for (const file of files) {
        try {
          // Kiểm tra file có tồn tại không
          if (!fs.existsSync(file.path)) {
            results.push({
              success: false,
              file: file.filename,
              error: "File không tồn tại",
            });
            continue;
          }

          const imageBuffer = fs.readFileSync(file.path);
          const base64Image = imageBuffer.toString("base64");

          const response = await axios.post(`${PYTHON_API_URL}/upload-face`, {
            name: name,
            image: `data:image/jpeg;base64,${base64Image}`,
          });

          results.push({
            success: true,
            file: file.filename,
            data: response.data,
          });
        } catch (err) {
          results.push({
            success: false,
            file: file.filename,
            error: err.message,
          });
        }

        // Xóa file tạm
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      res.json({
        success: true,
        message: `Upload ${results.filter((r) => r.success).length}/${
          files.length
        } ảnh thành công`,
        results: results,
      });
    } catch (error) {
      console.error("Error uploading multiple faces:", error.message);

      // Xóa tất cả file tạm nếu có lỗi
      if (req.files) {
        req.files.forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }

      res.status(500).json({
        success: false,
        message: "Lỗi khi upload nhiều ảnh",
        error: error.message,
      });
    }
  }

  // 11. Nhận diện khuôn mặt
  async recognizeFace(req, res) {
    try {
      const { image } = req.body;

      if (!image) {
        return res.status(400).json({
          success: false,
          message: "Thiếu ảnh",
        });
      }

      const response = await axios.post(`${PYTHON_API_URL}/recognize-face`, {
        image: image,
      });

      res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      console.error("Error recognizing face:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi nhận diện khuôn mặt",
        error: error.response?.data || error.message,
      });
    }
  }

  // 12. Lấy thông tin chi tiết người đã train
  async getPersonDetails(req, res) {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên",
        });
      }

      // Lấy danh sách ảnh của người này
      const imagesResponse = await axios.get(
        `${PYTHON_API_URL}/list-training-images`,
        {
          params: { name },
        }
      );

      // Lấy danh sách tất cả người đã train
      const peopleResponse = await axios.get(
        `${PYTHON_API_URL}/list-trained-people`
      );

      const personData = peopleResponse.data.people?.find(
        (p) => p.name === name
      );

      res.json({
        success: true,
        data: {
          name: name,
          face_count: personData?.face_count || 0,
          images: imagesResponse.data.images || [],
        },
      });
    } catch (error) {
      console.error("Error getting person details:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người",
        error: error.response?.data || error.message,
      });
    }
  }
}

module.exports = new FaceTrainingController();
