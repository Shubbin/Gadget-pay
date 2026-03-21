import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Upload, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/services/api';

export default function KYCVerification() {
  const [step, setStep] = useState(1);
  const [docType, setDocType] = useState('NIN');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      // Simulate/Implement actual upload via our /api/upload endpoint
      await api.post('/kyc/submit', {
        documentType: docType,
        documentUrl: 'https://placeholder.com/id.jpg' // Mock for now
      });
      toast.success('KYC Documents Submitted!');
      setStep(3);
    } catch (error) {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-12 bg-white/[0.02] border border-white/5 rounded-[3rem]">
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-center">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-12 w-12" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-display font-black tracking-tight text-white mb-4">Identity Verification</h2>
            <p className="text-gray-400 font-bold">Upload a government ID to unlock higher spending limits and exclusive installment rates.</p>
          </div>
          <Button onClick={() => setStep(2)} className="h-16 px-12 rounded-2xl bg-primary text-lg font-black uppercase tracking-widest">
            Start Verification
          </Button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <h3 className="text-2xl font-display font-black text-white">Select Document Type</h3>
          <div className="grid grid-cols-3 gap-4">
            {['NIN', 'Passport', 'Voter Card'].map((type) => (
              <button
                key={type}
                onClick={() => setDocType(type)}
                className={`p-6 rounded-3xl border-2 transition-all font-bold ${
                  docType === type ? 'border-primary bg-primary/10 text-white' : 'border-white/5 bg-white/[0.02] text-gray-500'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-12 text-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer">
            <Upload className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-600 mt-2 font-black uppercase">PNG, JPG up to 10MB</p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setStep(1)} className="h-16 flex-1 rounded-2xl text-gray-400 font-black uppercase tracking-widest">
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading} className="h-16 flex-1 rounded-2xl bg-primary font-black uppercase tracking-widest">
              {isUploading ? 'Uploading...' : 'Submit Profile'}
            </Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-[2.5rem] bg-green-500/10 flex items-center justify-center text-green-500">
              <CheckCircle className="h-12 w-12" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-display font-black tracking-tight text-white mb-4">Under Review</h2>
            <p className="text-gray-400 font-bold text-lg">Our team is verifying your documents. We'll notify you within 24 hours.</p>
          </div>
          <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 flex items-center gap-4 text-left">
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Verification Status</p>
              <p className="text-orange-500 text-xs font-black uppercase tracking-widest">Pending Verification</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
