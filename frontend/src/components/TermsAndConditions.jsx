import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const TermsAndConditions = ({ open, onClose, onAccept }) => {
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        if (accepted) {
            onAccept();
            onClose();
        }
    };

    const handleClose = () => {
        setAccepted(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h5" component="div">
                    Terms and Conditions
                </Typography>
            </DialogTitle>
            
            <DialogContent dividers>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>
                        1. Acceptance of Terms
                    </Typography>
                    <Typography paragraph>
                        By creating an account and using Study Group Finder, you agree to comply with and be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        2. User Responsibilities
                    </Typography>
                    <Typography paragraph>
                        • You must provide accurate and complete information during registration
                    </Typography>
                    <Typography paragraph>
                        • You are responsible for maintaining the confidentiality of your account credentials
                    </Typography>
                    <Typography paragraph>
                        • You must not share inappropriate, offensive, or copyrighted content in study groups
                    </Typography>
                    <Typography paragraph>
                        • You agree to use the platform solely for educational and study purposes
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        3. Study Group Guidelines
                    </Typography>
                    <Typography paragraph>
                        • All study groups must be created for legitimate educational purposes
                    </Typography>
                    <Typography paragraph>
                        • Group creators are responsible for moderating their groups appropriately
                    </Typography>
                    <Typography paragraph>
                        • Spam, harassment, or disruptive behavior is strictly prohibited
                    </Typography>
                    <Typography paragraph>
                        • Study materials shared must not violate copyright laws
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        4. Privacy and Data Protection
                    </Typography>
                    <Typography paragraph>
                        • We collect and store only necessary information for providing our services
                    </Typography>
                    <Typography paragraph>
                        • Your personal information will not be shared with third parties without consent
                    </Typography>
                    <Typography paragraph>
                        • You have the right to request deletion of your account and data
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        5. Platform Usage
                    </Typography>
                    <Typography paragraph>
                        • The service is provided "as is" without warranties of any kind
                    </Typography>
                    <Typography paragraph>
                        • We reserve the right to suspend or terminate accounts that violate these terms
                    </Typography>
                    <Typography paragraph>
                        • We may update these terms periodically, and continued use implies acceptance
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        6. Limitation of Liability
                    </Typography>
                    <Typography paragraph>
                        Study Group Finder shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our platform.
                    </Typography>

                    <Typography variant="h6" gutterBottom>
                        7. Contact Information
                    </Typography>
                    <Typography paragraph>
                        For questions regarding these terms, please contact us through the platform's support system.
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                        Last updated: June 2025
                    </Typography>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ flexDirection: 'column', gap: 2, p: 3 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="I have read and agree to the Terms and Conditions"
                    sx={{ alignSelf: 'flex-start' }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, alignSelf: 'flex-end' }}>
                    <Button onClick={handleClose} variant="outlined">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAccept} 
                        variant="contained"
                        disabled={!accepted}
                    >
                        Accept & Continue
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default TermsAndConditions;