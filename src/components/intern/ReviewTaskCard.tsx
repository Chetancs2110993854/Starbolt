import React, { useState } from 'react';
import { ReviewTask } from '../../types/review';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../common/StatusBadge';
import { DollarSign, ExternalLink, MapPin, AlertCircle, Upload, FileEdit } from 'lucide-react';
import { Alert } from '../ui/Alert';
import { Input } from '../ui/Input';
import { supabase } from '../../lib/supabase';

interface ReviewTaskCardProps {
  task: ReviewTask;
  onClaim?: () => void;
  onView: () => void;
}

export const ReviewTaskCard: React.FC<ReviewTaskCardProps> = ({ 
  task, 
  onClaim, 
  onView 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [reviewContent, setReviewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const isClaimable = task.status === 'pending' && !task.internId;
  const isInProgress = task.status === 'assigned';
  
  const handleClaim = async () => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('review_tasks')
        .update({ 
          status: 'assigned',
          intern_id: (await supabase.auth.getUser()).data.user?.id,
          assigned_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (onClaim) onClaim();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!screenshot || !reviewContent) {
      setError('Please provide both screenshot and review content');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload screenshot
      const fileName = `${task.id}/${Date.now()}-proof.png`;

      console.log(fileName)


      const { error: uploadError } = await supabase.storage
        .from('review-proofs')
        .upload(fileName, screenshot);
      
      if (uploadError) throw uploadError;
      console.log('Error:', uploadError);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('review-proofs')
        .getPublicUrl(fileName);
      
      // Create proof record
      const { error: proofError } = await supabase
        .from('review_proofs')
        .insert({
          task_id: task.id,
          intern_id: (await supabase.auth.getUser()).data.user?.id,
          screenshot_url: publicUrl,
          review_content: reviewContent
        });
      
      if (proofError) throw proofError;
      console.log("Proof error", proofError)
      
      // Update task status
      const { error: taskError } = await supabase
        .from('review_tasks')
        .update({ 
          status: 'submitted',
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);
      
      if (taskError) throw taskError;
      
      if (onView) onView();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit proof');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{task.businessName}</CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin size={14} className="mr-1" />
              <a 
                href={task.businessUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          </div>
          <StatusBadge status={task.status} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-500 mr-1" />
            <span className="font-medium">${task.commission.toFixed(2)}</span>
            <span className="text-gray-500 text-sm ml-1">commission</span>
          </div>
          
          {task.guidelines && task.guidelines.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-1">Review Guidelines:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-4">
                {task.guidelines.map((guideline, index) => (
                  <li key={index}>{guideline}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <Alert variant="error" title="Error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {isClaimable && (
            <Alert variant="info" title="How to complete this task">
              <ol className="list-decimal ml-4 space-y-1 text-sm">
                <li>Click "Claim Task" to start</li>
                <li>Visit the business on Google Maps</li>
                <li>Write and post your review following the guidelines</li>
                <li>Take a screenshot of your posted review</li>
                <li>Submit the screenshot and review text for approval</li>
              </ol>
            </Alert>
          )}

          {isInProgress && (
            <div className="space-y-4">
              <Input
                type="file"
                accept="image/*"
                label="Upload Review Screenshot"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                fullWidth
              />
              
              <Input
                type="textarea"
                label="Review Content"
                placeholder="Paste your review text here..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                fullWidth
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          size="sm"
          variant="outline"
          rightIcon={<ExternalLink size={16} />}
          onClick={() => window.open(task.businessUrl, '_blank', 'noopener,noreferrer')}
        >
          Visit Business
        </Button>
        
        {isClaimable ? (
          <Button 
            size="sm" 
            variant="primary" 
            onClick={handleClaim}
            isLoading={isSubmitting}
            leftIcon={<AlertCircle size={16} />}
          >
            Claim Task
          </Button>
        ) : isInProgress ? (
          <Button 
            size="sm" 
            variant="primary" 
            onClick={handleSubmitProof}
            isLoading={isSubmitting}
            leftIcon={<Upload size={16} />}
          >
            Submit Proof
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={onView}
          >
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};