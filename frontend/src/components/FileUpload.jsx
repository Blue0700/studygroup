import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const DropZone = styled(Box)(({ theme, isDragActive }) => ({
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
    }
}));

const FileUpload = ({ groupId, onFileUploaded }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [isDragActive, setIsDragActive] = useState(false);

    const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/webm'
    ];

    const validateFile = (file) => {
        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Only PDF, PPT, DOC, XLS, images, and videos are allowed.';
        }
        if (file.size > 50 * 1024 * 1024) { // 50MB
            return 'File size must be less than 50MB.';
        }
        return null;
    };

    const uploadFile = async (file) => {
        const validationError = validateFile(file);
        if (validationError) {
            setMessage(validationError);
            setMessageType('error');
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `http://localhost:3000/api/groups/${groupId}/files`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        authorization: token
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentCompleted);
                    }
                }
            );

            setMessage('File uploaded successfully!');
            setMessageType('success');
            if (onFileUploaded) {
                onFileUploaded(response.data.file);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setMessage(error.response?.data?.message || 'Failed to upload file');
            setMessageType('error');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            uploadFile(file);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragActive(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragActive(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            uploadFile(file);
        }
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Upload Materials
                </Typography>
                
                <DropZone
                    isDragActive={isDragActive}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload-input').click()}
                >
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                    <Typography variant="body1" gutterBottom>
                        Drag and drop files here, or click to select files
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Supported: PDF, PPT, DOC, XLS, Images, Videos (Max 50MB)
                    </Typography>
                </DropZone>

                <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    disabled={uploading}
                    sx={{ mt: 2 }}
                >
                    Choose Files
                    <VisuallyHiddenInput
                        id="file-upload-input"
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.avi,.mov,.wmv,.webm"
                    />
                </Button>

                {uploading && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Uploading... {uploadProgress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 1 }} />
                    </Box>
                )}

                {message && (
                    <Alert severity={messageType} sx={{ mt: 2 }}>
                        {message}
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default FileUpload;