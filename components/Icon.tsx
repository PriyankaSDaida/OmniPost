import React from 'react';
import { 
  Linkedin, 
  Twitter, 
  Instagram, 
  Copy, 
  Check, 
  Download, 
  Sparkles,
  Image as ImageIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  FileText
} from 'lucide-react';
import { Platform } from '../types';

export const PlatformIcon = ({ platform, className }: { platform: Platform; className?: string }) => {
  switch (platform) {
    case Platform.LINKEDIN:
      return <Linkedin className={className} />;
    case Platform.TWITTER:
      return <Twitter className={className} />;
    case Platform.INSTAGRAM:
      return <Instagram className={className} />;
    default:
      return null;
  }
};

export { 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  ImageIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  FileText
};