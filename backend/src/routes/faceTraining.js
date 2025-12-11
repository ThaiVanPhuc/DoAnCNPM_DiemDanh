const express = require('express');
const router = express.Router();
const faceTrainingController = require('../controllers/faceTraining.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa có
const uploadDir = 'uploads/face-training';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'face-' + uniqueSuffix + ext);
    }
});

// Filter để chỉ nhận file ảnh
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, WEBP)'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
    }
});

// ==================== ROUTES ====================

// 1. Upload ảnh chân dung (single file)
router.post('/upload-face', upload.single('image'), faceTrainingController.uploadFace);

// 2. Upload nhiều ảnh cùng lúc
router.post('/upload-multiple-faces', upload.array('images', 10), faceTrainingController.uploadMultipleFaces);

// 3. Chụp ảnh webcam (base64)
router.post('/capture-webcam', faceTrainingController.captureWebcam);

// 4. Training khuôn mặt
router.post('/train-face', faceTrainingController.trainFace);

// 5. Danh sách ảnh training
router.get('/list-training-images', faceTrainingController.listTrainingImages);

// 6. Xóa ảnh
router.delete('/delete-image', faceTrainingController.deleteImage);

// 7. Sinh embedding khuôn mặt
router.post('/generate-embedding', faceTrainingController.generateEmbedding);

// 8. Kiểm tra chất lượng ảnh
router.post('/check-image-quality', faceTrainingController.checkImageQuality);

// 9. Danh sách người đã train
router.get('/list-trained-people', faceTrainingController.listTrainedPeople);

// 10. Xóa người
router.delete('/delete-person', faceTrainingController.deletePerson);

// 11. Nhận diện khuôn mặt
router.post('/recognize-face', faceTrainingController.recognizeFace);

// 12. Lấy thông tin chi tiết người đã train
router.get('/person-details/:name', faceTrainingController.getPersonDetails);

// ==================== ERROR HANDLING ====================

// Xử lý lỗi multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File quá lớn. Giới hạn 10MB'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Quá nhiều file. Tối đa 10 file'
            });
        }
    }
    
    if (error.message === 'Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, WEBP)') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
});

module.exports = router;