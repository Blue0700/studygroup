import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import ArticleIcon from '@mui/icons-material/Article';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import axios from 'axios';

const FileList = ({ groupId, groupCreator, refreshTrigger }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, file: null });
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
        fetchFiles();
    }, [groupId, refreshTrigger]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/groups/${groupId}/files`);
            setFiles(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching files:', error);
            setError('Failed to load files');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.includes('pdf')) return <PictureAsPdfIcon color="error" />;
        if (mimeType.includes('image')) return <ImageIcon color="primary" />;
        if (mimeType.includes('video')) return <VideoFileIcon color="secondary" />;
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <SlideshowIcon color="warning" />;
        if (mimeType.includes('document') || mimeType.includes('word')) return <ArticleIcon color="info" />;
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return <TableChartIcon color="success" />;
        return <InsertDriveFileIcon />;
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = async (file) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/api/groups/${groupId}/files/${file._id}/download`,
                { responseType: 'blob' }
            );
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download file');
        }
    };

    const handleDeleteClick = (file) => {
        setDeleteDialog({ open: true, file });
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:3000/api/groups/${groupId}/files/${deleteDialog.file._id}`,
                {
                    headers: { authorization: token }
                }
            );
            
            setFiles(files.filter(f => f._id !== deleteDialog.file._id));
            setDeleteDialog({ open: false, file: null });
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete file');
        }
    };

    const canDeleteFile = (file) => {
        if (!currentUser) return false;
        
        // User can delete if they uploaded the file or if they're the group creator
        return file.uploadedBy._id === currentUser.id || groupCreator === currentUser.id;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Study Materials ({files.length})
                </Typography>
                
                {files.length === 0 ? (
                    <Typography color="text.secondary">
                        No materials uploaded yet. Be the first to share study materials!
                    </Typography>
                ) : (
                    <List>
                        {files.map((file) => (
                            <ListItem key={file._id} divider>
                                <ListItemIcon>
                                    {getFileIcon(file.mimeType)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.originalName}
                                    secondary={
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                                            <Chip 
                                                label={formatFileSize(file.fileSize)} 
                                                size="small" 
                                                variant="outlined" 
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                by {file.uploadedBy.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                on {formatDate(file.uploadedAt)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleDownload(file)}
                                        title="Download"
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                    {canDeleteFile(file) && (
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDeleteClick(file)}
                                            title="Delete"
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>

            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, file: null })}
            >
                <DialogTitle>Delete File</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{deleteDialog.file?.originalName}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, file: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default FileList;